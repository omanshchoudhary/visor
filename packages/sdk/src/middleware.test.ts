import express, { type Express, Router } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import type { RequestEvent } from "@visorhq/contract";

import { createRequestMiddleware, type Clock } from "./middleware.ts";
import { UNMATCHED_ROUTE } from "./route.ts";

const STARTED_AT = 1_700_000_000_000;

function fixedClock(readings: bigint[]): Clock {
    let index = 0;

    return {
        wallClock: () => STARTED_AT,
        monotonic: () => readings[index++] ?? 0n,
    };
}

async function collect(
    build: (app: Express) => void,
    path: string,
    options: { clock?: Clock; method?: "get" | "post" } = {},
): Promise<RequestEvent[]> {
    const app = express();
    const events: RequestEvent[] = [];
    let settle: (() => void) | undefined;
    const recorded = new Promise<void>((resolve) => {
        settle = resolve;
    });

    app.use(
        createRequestMiddleware({
            clock: options.clock,
            record: (event) => {
                events.push(event);
                settle?.();
            },
        }),
    );
    build(app);

    await request(app)[options.method ?? "get"](path);
    await recorded;

    return events;
}

describe("createRequestMiddleware", () => {
    it("records the template, method, status and duration", async () => {
        const events = await collect(
            (app) => {
                app.get("/users/:id", (_req, res) => {
                    res.sendStatus(200);
                });
            },
            "/users/42",
            { clock: fixedClock([0n, 12_500_000n]) },
        );

        expect(events).toEqual([
            {
                route: "/users/:id",
                method: "GET",
                statusCode: 200,
                durationMs: 12.5,
                startedAt: STARTED_AT,
            },
        ]);
    });

    it("records a mounted route without the live id", async () => {
        const events = await collect((app) => {
            const projects = Router({ mergeParams: true });
            projects.get("/:projectId", (_req, res) => {
                res.sendStatus(200);
            });
            app.use("/api/orgs/:organizationId/projects", projects);
        }, "/api/orgs/0a9f1c3e/projects/7b2d");

        expect(events[0]?.route).toBe("/api/orgs/:organizationId/projects/:projectId");
    });

    it("records an unmatched request in one bucket", async () => {
        const events = await collect((app) => {
            app.get("/health", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/nothing/here");

        expect(events[0]?.route).toBe(UNMATCHED_ROUTE);
        expect(events[0]?.statusCode).toBe(404);
    });

    it("records a failed request once with its status", async () => {
        const events = await collect((app) => {
            app.get("/users/:id", () => {
                throw new Error("boom");
            });
        }, "/users/42");

        expect(events).toHaveLength(1);
        expect(events[0]?.route).toBe("/users/:id");
        expect(events[0]?.statusCode).toBe(500);
    });

    it("records a request exactly once even though finish and close both fire", async () => {
        const events = await collect((app) => {
            app.get("/health", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/health");
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(events).toHaveLength(1);
    });

    it("uses a real clock when none is given", async () => {
        const events = await collect((app) => {
            app.get("/health", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/health");

        expect(events[0]?.durationMs).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(events[0]?.durationMs)).toBe(true);
        expect(events[0]?.startedAt).toBeGreaterThan(1_600_000_000_000);
    });

    it("keeps the method on a non GET request", async () => {
        const events = await collect(
            (app) => {
                app.post("/users", (_req, res) => {
                    res.sendStatus(201);
                });
            },
            "/users",
            { method: "post" },
        );

        expect(events[0]?.method).toBe("POST");
        expect(events[0]?.statusCode).toBe(201);
    });
});
