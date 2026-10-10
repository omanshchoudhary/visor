import express, { type Express, Router } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { routeTemplate, UNMATCHED_ROUTE } from "./route.ts";

async function templateFor(
    build: (app: Express) => void,
    path: string,
    method: "get" | "post" = "get",
): Promise<string> {
    const app = express();
    let settle: ((template: string) => void) | undefined;
    const finished = new Promise<string>((resolve) => {
        settle = resolve;
    });

    app.use((req, res, next) => {
        res.on("finish", () => {
            try {
                settle?.(routeTemplate(req));
            } catch (error) {
                settle?.(`threw ${String(error)}`);
            }
        });
        next();
    });
    build(app);

    await request(app)[method](path);

    return finished;
}

describe("routeTemplate", () => {
    it("returns a static path unchanged", async () => {
        const template = await templateFor((app) => {
            app.get("/health", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/health");

        expect(template).toBe("/health");
    });

    it("keeps the parameter name instead of the value", async () => {
        const template = await templateFor((app) => {
            app.get("/users/:id", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/users/42");

        expect(template).toBe("/users/:id");
    });

    it("keeps every parameter in a multi parameter route", async () => {
        const template = await templateFor((app) => {
            app.get("/orgs/:orgId/projects/:projectId", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/orgs/acme/projects/checkout");

        expect(template).toBe("/orgs/:orgId/projects/:projectId");
    });

    it("includes the mount path of a router", async () => {
        const template = await templateFor((app) => {
            const users = Router();
            users.get("/:id", (_req, res) => {
                res.sendStatus(200);
            });
            app.use("/api/users", users);
        }, "/api/users/42");

        expect(template).toBe("/api/users/:id");
    });

    it("keeps a parameter that lives in the mount path", async () => {
        const template = await templateFor((app) => {
            const projects = Router({ mergeParams: true });
            projects.get("/:projectId", (_req, res) => {
                res.sendStatus(200);
            });
            app.use("/api/orgs/:organizationId/projects", projects);
        }, "/api/orgs/0a9f1c3e/projects/7b2d");

        expect(template).toBe("/api/orgs/:organizationId/projects/:projectId");
    });

    it("walks two levels of mounted routers", async () => {
        const template = await templateFor((app) => {
            const keys = Router({ mergeParams: true });
            keys.get("/:apiKeyId", (_req, res) => {
                res.sendStatus(200);
            });

            const projects = Router({ mergeParams: true });
            projects.use("/:projectId/keys", keys);

            app.use("/api/orgs/:organizationId/projects", projects);
        }, "/api/orgs/0a9f1c3e/projects/7b2d/keys/f41a");

        expect(template).toBe("/api/orgs/:organizationId/projects/:projectId/keys/:apiKeyId");
    });

    it("ignores the query string", async () => {
        const template = await templateFor((app) => {
            app.get("/users/:id", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/users/42?include=orders");

        expect(template).toBe("/users/:id");
    });

    it("buckets an unmatched request", async () => {
        const template = await templateFor((app) => {
            app.get("/health", (_req, res) => {
                res.sendStatus(200);
            });
        }, "/nothing/here");

        expect(template).toBe(UNMATCHED_ROUTE);
    });

    it("buckets an unmatched method on a known path", async () => {
        const template = await templateFor(
            (app) => {
                app.get("/users/:id", (_req, res) => {
                    res.sendStatus(200);
                });
            },
            "/users/42",
            "post",
        );

        expect(template).toBe(UNMATCHED_ROUTE);
    });

    it("still reports the route when the handler fails", async () => {
        const template = await templateFor((app) => {
            app.get("/users/:id", () => {
                throw new Error("boom");
            });
        }, "/users/42");

        expect(template).toBe("/users/:id");
    });

    it("does not leave a trailing slash on a router root", async () => {
        const template = await templateFor((app) => {
            const users = Router();
            users.get("/", (_req, res) => {
                res.sendStatus(200);
            });
            app.use("/api/users", users);
        }, "/api/users");

        expect(template).toBe("/api/users");
    });

    it("keeps a value that looks like another segment", async () => {
        const template = await templateFor((app) => {
            const projects = Router({ mergeParams: true });
            projects.get("/:projectId", (_req, res) => {
                res.sendStatus(200);
            });
            app.use("/api/orgs/:organizationId/projects", projects);
        }, "/api/orgs/projects/projects/7b2d");

        expect(template).toBe("/api/orgs/:organizationId/projects/:projectId");
    });
});
