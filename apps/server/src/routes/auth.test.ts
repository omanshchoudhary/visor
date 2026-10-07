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

describe("POST /api/auth/login", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("returns 200 with an access token and refresh cookie", async () => {
        const signup = await request(app).post("/api/auth/register").send({
            email: "ada@example.com",
            name: "Ada",
            password: "password1",
        });

        const response = await request(app).post("/api/auth/login").send({
            email: "ada@example.com",
            password: "password1",
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: {
                id: (signup.body as { id: string }).id,
                email: "ada@example.com",
                name: "Ada",
            },
            accessToken: expect.any(String) as string,
        });
        expect(response.body).not.toHaveProperty("passwordHash");
        expect(response.body).not.toHaveProperty("refreshToken");

        const cookies = response.headers["set-cookie"];
        expect(cookies).toEqual(
            expect.arrayContaining([expect.stringMatching(/^refreshToken=.+HttpOnly/) as string]),
        );
    });

    it("returns 401 for a wrong password", async () => {
        await request(app).post("/api/auth/register").send({
            email: "ada@example.com",
            name: "Ada",
            password: "password1",
        });

        const response = await request(app).post("/api/auth/login").send({
            email: "ada@example.com",
            password: "wrong-password",
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Invalid email or password" });
    });

    it("returns 401 for an unknown email", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: "nobody@example.com",
            password: "password1",
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Invalid email or password" });
    });

    it("returns 400 for a bad body", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: "not-an-email",
            password: "",
        });

        const body = response.body as { error: string; fields?: unknown };

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid request");
        expect(body.fields).toBeDefined();
    });
});

function refreshCookie(headers: Record<string, unknown>): string {
    const cookies = headers["set-cookie"] as string[] | undefined;
    const cookie = cookies?.find((value) => value.startsWith("refreshToken="));

    if (cookie === undefined) {
        throw new Error("no refresh cookie was set");
    }

    return cookie.split(";")[0] ?? cookie;
}

async function signIn(): Promise<string> {
    await request(app).post("/api/auth/register").send({
        email: "ada@example.com",
        name: "Ada",
        password: "password1",
    });
    const login = await request(app).post("/api/auth/login").send({
        email: "ada@example.com",
        password: "password1",
    });

    return refreshCookie(login.headers);
}

describe("POST /api/auth/refresh", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("returns a new access token and rotates the cookie", async () => {
        const cookie = await signIn();

        const response = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
        const body = response.body as { accessToken: string };

        expect(response.status).toBe(200);
        expect(body.accessToken).toEqual(expect.any(String) as string);
        expect(refreshCookie(response.headers)).not.toBe(cookie);
    });

    it("returns 401 without a cookie", async () => {
        await signIn();

        const response = await request(app).post("/api/auth/refresh");

        expect(response.status).toBe(401);
    });

    it("returns 401 for an unknown token", async () => {
        await signIn();

        const response = await request(app)
            .post("/api/auth/refresh")
            .set("Cookie", "refreshToken=not-a-real-token");

        expect(response.status).toBe(401);
    });

    it("kills the whole session when an old token is replayed", async () => {
        const first = await signIn();

        const rotated = await request(app).post("/api/auth/refresh").set("Cookie", first);
        const second = refreshCookie(rotated.headers);

        const replay = await request(app).post("/api/auth/refresh").set("Cookie", first);
        const afterReplay = await request(app).post("/api/auth/refresh").set("Cookie", second);

        expect(replay.status).toBe(401);
        expect(afterReplay.status).toBe(401);
    });
});

describe("POST /api/auth/logout", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("returns 204 and clears the cookie", async () => {
        const cookie = await signIn();

        const response = await request(app).post("/api/auth/logout").set("Cookie", cookie);
        const cleared = response.headers["set-cookie"] as unknown as string[];

        expect(response.status).toBe(204);
        expect(cleared.join(";")).toMatch(/refreshToken=;/);
        expect(cleared.join(";")).toMatch(/Path=\/api\/auth/);
    });

    it("stops the refresh token from working", async () => {
        const cookie = await signIn();

        await request(app).post("/api/auth/logout").set("Cookie", cookie);
        const response = await request(app).post("/api/auth/refresh").set("Cookie", cookie);

        expect(response.status).toBe(401);
    });

    it("returns 204 without a cookie", async () => {
        const response = await request(app).post("/api/auth/logout");

        expect(response.status).toBe(204);
    });

    it("returns 204 for an unknown token", async () => {
        const response = await request(app)
            .post("/api/auth/logout")
            .set("Cookie", "refreshToken=not-a-real-token");

        expect(response.status).toBe(204);
    });
});
