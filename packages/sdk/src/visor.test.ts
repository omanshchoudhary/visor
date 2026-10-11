import express, { type Express } from "express";
import type { Server } from "node:http";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import type { RequestEvent } from "@visorhq/contract";

import { visor } from "./visor.ts";

const servers: Server[] = [];

async function listen(app: Express): Promise<string> {
    const server = app.listen(0);
    servers.push(server);
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    return `http://127.0.0.1:${port}`;
}

// stands in for the visor server, so the whole chain runs for real
async function receiver(): Promise<{ url: string; batches: RequestEvent[][]; keys: string[] }> {
    const batches: RequestEvent[][] = [];
    const keys: string[] = [];
    const app = express();

    app.use(express.json());
    app.post("/api/ingest", (req, res) => {
        batches.push((req.body as { events: RequestEvent[] }).events);
        keys.push(req.headers.authorization ?? "");
        res.sendStatus(202);
    });

    return { url: await listen(app), batches, keys };
}

afterEach(() => {
    for (const server of servers.splice(0)) {
        server.close();
    }
});

describe("visor", () => {
    it("delivers a recorded request to the ingest endpoint", async () => {
        const target = await receiver();
        const app = express();
        const middleware = visor({
            url: target.url,
            key: "visor_ingest_abc",
            batchSize: 1,
        });

        app.use(middleware);
        app.get("/users/:id", (_req, res) => {
            res.sendStatus(200);
        });

        await request(app).get("/users/42");
        await middleware.close();

        expect(target.batches.flat()).toHaveLength(1);
        expect(target.batches.flat()[0]).toMatchObject({
            route: "/users/:id",
            method: "GET",
            statusCode: 200,
        });
        expect(target.keys[0]).toBe("Bearer visor_ingest_abc");
    });

    it("sends what is left when it closes", async () => {
        const target = await receiver();
        const app = express();
        const middleware = visor({
            url: target.url,
            key: "visor_ingest_abc",
            batchSize: 50,
            flushIntervalMs: 60_000,
        });

        app.use(middleware);
        app.get("/health", (_req, res) => {
            res.sendStatus(200);
        });

        await request(app).get("/health");
        await request(app).get("/health");
        expect(target.batches).toHaveLength(0);

        await middleware.close();

        expect(target.batches.flat()).toHaveLength(2);
    });

    it("leaves the host app alone when visor is unreachable", async () => {
        const app = express();
        const middleware = visor({
            url: "http://127.0.0.1:1",
            key: "visor_ingest_abc",
            batchSize: 1,
            maxRetries: 0,
        });

        app.use(middleware);
        app.get("/users/:id", (_req, res) => {
            res.json({ ok: true });
        });

        const first = await request(app).get("/users/1");
        const second = await request(app).get("/users/2");

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        await expect(middleware.close()).resolves.toBeUndefined();
    });
});
