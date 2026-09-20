import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { resetDatabase } from "../test/database.ts";

describe("POST /api/auth/register", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("returns 201 without a password hash", async () => {
        const response = await request(app).post("/api/auth/register").send({
            email: "ada@example.com",
            name: "Ada",
            password: "password1",
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            id: expect.any(String) as string,
            email: "ada@example.com",
            name: "Ada",
        });
        expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("returns 409 for a duplicate email", async () => {
        const body = {
            email: "ada@example.com",
            name: "Ada",
            password: "password1",
        };

        await request(app).post("/api/auth/register").send(body);
        const response = await request(app).post("/api/auth/register").send(body);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ error: "Email already taken" });
    });

    it("returns 400 for a bad body", async () => {
        const response = await request(app).post("/api/auth/register").send({
            email: "not-an-email",
            name: "Ada",
            password: "short",
        });

        const body = response.body as { error: string; fields?: unknown };

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid request");
        expect(body.fields).toBeDefined();
    });
});
