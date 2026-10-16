import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import type { RequestEvent } from "@visorhq/contract";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import { createApiKey, createOrganization, createProject, signUp } from "../test/api.ts";
import { resetDatabase } from "../test/database.ts";

type Target = {
    projectId: string;
    key: string;
    apiKeyId: string;
};

async function setUpProject(): Promise<Target> {
    const owner = await signUp("owner@example.com");
    const organizationId = await createOrganization(owner, "Acme");
    const projectId = await createProject(owner, organizationId, "checkout-api");
    const apiKey = await createApiKey(owner, organizationId, projectId);

    return { projectId, key: apiKey.key, apiKeyId: apiKey.id };
}

function event(overrides: Partial<RequestEvent> = {}): RequestEvent {
    return {
        id: randomUUID(),
        route: "/users/:id",
        method: "GET",
        statusCode: 200,
        durationUs: 12_500,
        startedAt: Date.now(),
        ...overrides,
    };
}

function send(key: string, events: RequestEvent[]) {
    return request(app).post("/api/ingest").set("Authorization", `Bearer ${key}`).send({ events });
}

describe("POST /api/ingest", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("stores a batch against the project the key belongs to", async () => {
        const { key, projectId } = await setUpProject();
        const events = [event(), event({ route: "/orders", method: "POST", statusCode: 201 })];

        const response = await send(key, events);
        const stored = await prisma.event.findMany({ orderBy: { route: "asc" } });

        expect(response.status).toBe(202);
        expect(response.body).toEqual({ received: 2, stored: 2 });
        expect(stored).toHaveLength(2);
        expect(stored[0]).toMatchObject({
            projectId,
            route: "/orders",
            method: "POST",
            statusCode: 201,
        });
        expect(stored[1]?.durationUs).toBe(12_500);
    });

    it("counts a replayed batch once", async () => {
        const { key } = await setUpProject();
        const events = [event(), event()];

        const first = await send(key, events);
        const second = await send(key, events);

        expect(first.body).toEqual({ received: 2, stored: 2 });
        expect(second.status).toBe(202);
        expect(second.body).toEqual({ received: 2, stored: 0 });
        expect(await prisma.event.count()).toBe(2);
    });

    it("stores only the events it has not seen before", async () => {
        const { key } = await setUpProject();
        const seen = event();

        await send(key, [seen]);
        const response = await send(key, [seen, event()]);

        expect(response.body).toEqual({ received: 2, stored: 1 });
        expect(await prisma.event.count()).toBe(2);
    });

    it("records when the key was last used", async () => {
        const { key, apiKeyId } = await setUpProject();
        const before = await prisma.apiKey.findUniqueOrThrow({
            where: { id: apiKeyId },
            select: { lastUsedAt: true },
        });

        await send(key, [event()]);
        const after = await prisma.apiKey.findUniqueOrThrow({
            where: { id: apiKeyId },
            select: { lastUsedAt: true },
        });

        expect(before.lastUsedAt).toBeNull();
        expect(after.lastUsedAt).not.toBeNull();
    });

    it("distrusts a host clock that is far out", async () => {
        const { key } = await setUpProject();
        const wayAhead = Date.now() + 365 * 24 * 60 * 60 * 1000;

        await send(key, [event({ startedAt: wayAhead })]);
        const stored = await prisma.event.findFirstOrThrow();

        expect(stored.startedAt.getTime()).toBeLessThan(Date.now() + 60_000);
    });

    it("keeps a host clock that is close enough", async () => {
        const { key } = await setUpProject();
        const slightlyBehind = Date.now() - 30_000;

        await send(key, [event({ startedAt: slightlyBehind })]);
        const stored = await prisma.event.findFirstOrThrow();

        expect(stored.startedAt.getTime()).toBe(slightlyBehind);
    });

    it("rejects a read key", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        const projectId = await createProject(owner, organizationId, "checkout-api");
        const readKey = await createApiKey(owner, organizationId, projectId, "READ");

        const response = await send(readKey.key, [event()]);

        expect(response.status).toBe(401);
        expect(await prisma.event.count()).toBe(0);
    });

    it("rejects a revoked key", async () => {
        const { key, apiKeyId } = await setUpProject();
        await prisma.apiKey.update({
            where: { id: apiKeyId },
            data: { revokedAt: new Date() },
        });

        const response = await send(key, [event()]);

        expect(response.status).toBe(401);
        expect(await prisma.event.count()).toBe(0);
    });

    it("rejects an unknown key", async () => {
        await setUpProject();

        const response = await send("visor_ingest_nope", [event()]);

        expect(response.status).toBe(401);
    });

    it("rejects a request with no key", async () => {
        await setUpProject();

        const response = await request(app)
            .post("/api/ingest")
            .send({ events: [event()] });

        expect(response.status).toBe(401);
    });

    it("rejects a malformed event", async () => {
        const { key } = await setUpProject();

        const response = await send(key, [event({ statusCode: 9000 })]);

        expect(response.status).toBe(400);
        expect(await prisma.event.count()).toBe(0);
    });

    it("rejects an empty batch", async () => {
        const { key } = await setUpProject();

        const response = await send(key, []);

        expect(response.status).toBe(400);
    });

    it("refuses a key that outruns its rate limit", async () => {
        const { key } = await setUpProject();
        const batch = () =>
            send(
                key,
                Array.from({ length: 100 }, () => event()),
            );

        await batch();
        await batch();
        const response = await batch();

        expect(response.status).toBe(429);
        expect(response.headers["retry-after"]).toBe("1");
        expect(await prisma.event.count()).toBe(200);
    });

    it("deletes events with the project", async () => {
        const { key, projectId } = await setUpProject();
        await send(key, [event()]);

        await prisma.project.delete({ where: { id: projectId } });

        expect(await prisma.event.count()).toBe(0);
    });
});
