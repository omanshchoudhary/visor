import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import { addMember, createOrganization, createProject, signUp } from "../test/api.ts";
import { resetDatabase } from "../test/database.ts";

const credentials = {
    email: "ada@example.com",
    name: "Ada",
    password: "password1",
};

async function signIn(): Promise<{ userId: string; accessToken: string; refreshCookie: string }> {
    const signup = await request(app).post("/api/auth/register").send(credentials);
    const login = await request(app)
        .post("/api/auth/login")
        .send({ email: credentials.email, password: credentials.password });
    const cookies = login.headers["set-cookie"] as string[] | undefined;
    const cookie = cookies?.find((value) => value.startsWith("refreshToken=")) ?? "";

    return {
        userId: (signup.body as { id: string }).id,
        accessToken: (login.body as { accessToken: string }).accessToken,
        refreshCookie: cookie.split(";")[0] ?? cookie,
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

describe("PATCH /api/users/me", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("renames the signed in user", async () => {
        const { accessToken } = await signIn();

        const response = await request(app)
            .patch("/api/users/me")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Ada Lovelace" });

        expect(response.status).toBe(200);
        expect((response.body as { name: string }).name).toBe("Ada Lovelace");
    });

    it("returns 400 for a blank name", async () => {
        const { accessToken } = await signIn();

        const response = await request(app)
            .patch("/api/users/me")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "" });

        expect(response.status).toBe(400);
    });
});

describe("POST /api/users/me/password", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("rejects a wrong current password", async () => {
        const { accessToken } = await signIn();

        const response = await request(app)
            .post("/api/users/me/password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ currentPassword: "not-the-password", newPassword: "password2" });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Invalid password" });
    });

    it("returns 400 for a short new password", async () => {
        const { accessToken } = await signIn();

        const response = await request(app)
            .post("/api/users/me/password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ currentPassword: credentials.password, newPassword: "short" });

        expect(response.status).toBe(400);
    });

    it("changes the password and logs every session out", async () => {
        const { accessToken, refreshCookie } = await signIn();

        const changed = await request(app)
            .post("/api/users/me/password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ currentPassword: credentials.password, newPassword: "password2" });

        const oldRefresh = await request(app)
            .post("/api/auth/refresh")
            .set("Cookie", refreshCookie);
        const oldPassword = await request(app)
            .post("/api/auth/login")
            .send({ email: credentials.email, password: credentials.password });
        const newPassword = await request(app)
            .post("/api/auth/login")
            .send({ email: credentials.email, password: "password2" });

        expect(changed.status).toBe(204);
        expect(oldRefresh.status).toBe(401);
        expect(oldPassword.status).toBe(401);
        expect(newPassword.status).toBe(200);
    });
});

describe("DELETE /api/users/me", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("deletes the account and any organization it alone administers", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await createProject(owner, organizationId, "checkout-api");

        const response = await request(app)
            .delete("/api/users/me")
            .set("Authorization", `Bearer ${owner.token}`);
        const login = await request(app)
            .post("/api/auth/login")
            .send({ email: "owner@example.com", password: "password1" });

        expect(response.status).toBe(204);
        expect(login.status).toBe(401);
        expect(await prisma.user.count()).toBe(0);
        expect(await prisma.organization.count()).toBe(0);
        expect(await prisma.project.count()).toBe(0);
    });

    it("refuses while it is the last admin of a shared organization", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const response = await request(app)
            .delete("/api/users/me")
            .set("Authorization", `Bearer ${owner.token}`);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            error: "Hand over or delete the organizations you administer first",
        });
        expect(await prisma.user.count()).toBe(2);
    });

    it("lets a plain member delete their account", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const response = await request(app)
            .delete("/api/users/me")
            .set("Authorization", `Bearer ${member.token}`);

        expect(response.status).toBe(204);
        expect(await prisma.user.count()).toBe(1);
        expect(await prisma.organization.count()).toBe(1);
    });
});
