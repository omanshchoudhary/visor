import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import { addMember, createOrganization, createProject, signUp } from "../test/api.ts";
import { resetDatabase } from "../test/database.ts";

type Owner = {
    owner: Awaited<ReturnType<typeof signUp>>;
    organizationId: string;
    projectId: string;
};

async function setUpProject(): Promise<Owner> {
    const owner = await signUp("owner@example.com");
    const organizationId = await createOrganization(owner, "Acme");
    const projectId = await createProject(owner, organizationId, "checkout-api");

    return { owner, organizationId, projectId };
}

describe("api key routes", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("returns the raw key exactly once", async () => {
        const { owner, organizationId, projectId } = await setUpProject();

        const created = await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "production", type: "INGEST" });
        const body = created.body as { id: string; key: string; keyPrefix: string; type: string };

        const listed = await request(app)
            .get(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`);
        const list = listed.body as { key?: string; keyPrefix: string }[];

        expect(created.status).toBe(201);
        expect(body.key).toMatch(/^visor_ingest_/);
        expect(body.keyPrefix).toBe(body.key.slice(0, body.keyPrefix.length));
        expect(body.type).toBe("INGEST");

        expect(listed.status).toBe(200);
        expect(list).toHaveLength(1);
        expect(list[0]?.key).toBeUndefined();
        expect(list[0]?.keyPrefix).toBe(body.keyPrefix);
    });

    it("stores only a hash of the key", async () => {
        const { owner, organizationId, projectId } = await setUpProject();

        const created = await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "production", type: "READ" });
        const body = created.body as { id: string; key: string };

        const stored = await prisma.apiKey.findUniqueOrThrow({
            where: { id: body.id },
            select: { keyHash: true },
        });

        expect(body.key).toMatch(/^visor_read_/);
        expect(stored.keyHash).not.toBe(body.key);
        expect(stored.keyHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("returns 400 for an unknown key type", async () => {
        const { owner, organizationId, projectId } = await setUpProject();

        const response = await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "production", type: "ADMIN" });

        expect(response.status).toBe(400);
    });

    it("hides keys on a project in another organization", async () => {
        const { projectId } = await setUpProject();
        const stranger = await signUp("stranger@example.com");
        const strangerOrganizationId = await createOrganization(stranger, "Initech");

        const response = await request(app)
            .get(`/api/orgs/${strangerOrganizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${stranger.token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Project not found" });
    });

    it("lets a member list but not create", async () => {
        const { owner, organizationId, projectId } = await setUpProject();
        const member = await signUp("member@example.com");
        await addMember(member, organizationId, "MEMBER");
        await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "production", type: "INGEST" });

        const listed = await request(app)
            .get(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${member.token}`);
        const created = await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ name: "staging", type: "INGEST" });

        expect(listed.status).toBe(200);
        expect(created.status).toBe(403);
    });

    it("revokes a key and keeps the first revocation time", async () => {
        const { owner, organizationId, projectId } = await setUpProject();
        const created = await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "production", type: "INGEST" });
        const apiKeyId = (created.body as { id: string }).id;

        const first = await request(app)
            .delete(`/api/orgs/${organizationId}/projects/${projectId}/keys/${apiKeyId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        const afterFirst = await prisma.apiKey.findUniqueOrThrow({
            where: { id: apiKeyId },
            select: { revokedAt: true },
        });

        const second = await request(app)
            .delete(`/api/orgs/${organizationId}/projects/${projectId}/keys/${apiKeyId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        const afterSecond = await prisma.apiKey.findUniqueOrThrow({
            where: { id: apiKeyId },
            select: { revokedAt: true },
        });

        expect(first.status).toBe(204);
        expect(afterFirst.revokedAt).not.toBeNull();
        expect(second.status).toBe(204);
        expect(afterSecond.revokedAt).toEqual(afterFirst.revokedAt);
    });

    it("returns 404 revoking a key that is not there", async () => {
        const { owner, organizationId, projectId } = await setUpProject();

        const response = await request(app)
            .delete(
                `/api/orgs/${organizationId}/projects/${projectId}/keys/00000000-0000-0000-0000-000000000000`,
            )
            .set("Authorization", `Bearer ${owner.token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "API key not found" });
    });

    it("deletes keys with the project", async () => {
        const { owner, organizationId, projectId } = await setUpProject();
        await request(app)
            .post(`/api/orgs/${organizationId}/projects/${projectId}/keys`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "production", type: "INGEST" });

        await request(app)
            .delete(`/api/orgs/${organizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(await prisma.apiKey.count()).toBe(0);
    });

    it("returns 401 without an access token", async () => {
        const { organizationId, projectId } = await setUpProject();

        const response = await request(app).get(
            `/api/orgs/${organizationId}/projects/${projectId}/keys`,
        );

        expect(response.status).toBe(401);
    });
});
