import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../app.ts";

describe("GET /health", () => {
    it("reports the database as connected", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok", database: "connected" });
    });

    it("returns json 404 for an unknown route", async () => {
        const response = await request(app).get("/nope");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Not found" });
    });
});
