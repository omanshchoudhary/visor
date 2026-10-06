import express, { type Express } from "express";
import { SignJWT } from "jose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { config } from "../config.ts";
import { errorHandler } from "./error-handler.ts";
import { requireAuth } from "./require-auth.ts";

const authSecret = new TextEncoder().encode(config.AUTH_SECRET);
const otherSecret = new TextEncoder().encode("another-secret-that-is-long-enough-xx");

function buildApp(): Express {
    const app = express();

    app.get("/protected", requireAuth, (req, res) => {
        res.status(200).json({ userId: req.userId, sessionId: req.sessionId });
    });
    app.use(errorHandler);

    return app;
}

async function signToken(
    claims: Record<string, unknown> = { sub: "user-1", sid: "session-1" },
    options: { secret?: Uint8Array; expiresIn?: string } = {},
): Promise<string> {
    return new SignJWT(claims)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(options.expiresIn ?? "15m")
        .sign(options.secret ?? authSecret);
}

describe("requireAuth", () => {
    it("attaches the user and session for a valid token", async () => {
        const token = await signToken();
        const response = await request(buildApp())
            .get("/protected")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ userId: "user-1", sessionId: "session-1" });
    });

    it("returns 401 without an authorization header", async () => {
        const response = await request(buildApp()).get("/protected");

        expect(response.status).toBe(401);
    });

    it("returns 401 for a scheme other than bearer", async () => {
        const token = await signToken();
        const response = await request(buildApp())
            .get("/protected")
            .set("Authorization", `Basic ${token}`);

        expect(response.status).toBe(401);
    });

    it("returns 401 for a malformed token", async () => {
        const response = await request(buildApp())
            .get("/protected")
            .set("Authorization", "Bearer not-a-jwt");

        expect(response.status).toBe(401);
    });

    it("returns 401 for a token signed with another secret", async () => {
        const token = await signToken(undefined, { secret: otherSecret });
        const response = await request(buildApp())
            .get("/protected")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(401);
    });

    it("returns 401 for an expired token", async () => {
        const token = await signToken(undefined, { expiresIn: "-1m" });
        const response = await request(buildApp())
            .get("/protected")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(401);
    });

    it("returns 401 when the token has no session id", async () => {
        const token = await signToken({ sub: "user-1" });
        const response = await request(buildApp())
            .get("/protected")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(401);
    });
});
