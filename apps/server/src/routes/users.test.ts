import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import { resetDatabase } from "../test/database.ts";

const credentials = {
    email: "ada@example.com",
    name: "Ada",
    password: "password1",
};

async function signIn(): Promise<{ userId: string; accessToken: string }> {
    const signup = await request(app).post("/api/auth/register").send(credentials);
    const login = await request(app)
        .post("/api/auth/login")
        .send({ email: credentials.email, password: credentials.password });

    return {
        userId: (signup.body as { id: string }).id,
        accessToken: (login.body as { accessToken: string }).accessToken,
    };
}

describe("GET /api/users/me", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("returns the signed in user", async () => {
        const { userId, accessToken } = await signIn();

        const response = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: userId,
            email: credentials.email,
            name: credentials.name,
            createdAt: expect.any(String) as string,
        });
        expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("returns 401 without an access token", async () => {
        await signIn();

        const response = await request(app).get("/api/users/me");

        expect(response.status).toBe(401);
    });

    it("returns 404 when the user no longer exists", async () => {
        const { userId, accessToken } = await signIn();
        await prisma.user.delete({ where: { id: userId } });

        const response = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "User not found" });
    });
});
