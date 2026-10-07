import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import { resetDatabase } from "../test/database.ts";

type Account = {
    userId: string;
    token: string;
};

async function signUp(email: string): Promise<Account> {
    const signup = await request(app)
        .post("/api/auth/register")
        .send({ email, name: "Tester", password: "password1" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "password1" });

    return {
        userId: (signup.body as { id: string }).id,
        token: (login.body as { accessToken: string }).accessToken,
    };
}

async function createOrganization(account: Account, name: string): Promise<string> {
    const response = await request(app)
        .post("/api/orgs")
        .set("Authorization", `Bearer ${account.token}`)
        .send({ name });

    return (response.body as { id: string }).id;
}

describe("organization routes", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("creates an organization with the creator as admin", async () => {
        const owner = await signUp("owner@example.com");

        const response = await request(app)
            .post("/api/orgs")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "Acme" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            id: expect.any(String) as string,
            name: "Acme",
            role: "ADMIN",
            createdAt: expect.any(String) as string,
        });
    });

    it("returns 400 for a blank name", async () => {
        const owner = await signUp("owner@example.com");

        const response = await request(app)
            .post("/api/orgs")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "" });

        expect(response.status).toBe(400);
    });

    it("lists only the organizations you belong to", async () => {
        const owner = await signUp("owner@example.com");
        const stranger = await signUp("stranger@example.com");
        await createOrganization(owner, "Acme");
        await createOrganization(owner, "Globex");
        await createOrganization(stranger, "Initech");

        const response = await request(app)
            .get("/api/orgs")
            .set("Authorization", `Bearer ${owner.token}`);
        const body = response.body as { name: string }[];

        expect(response.status).toBe(200);
        expect(body.map((organization) => organization.name).sort()).toEqual(["Acme", "Globex"]);
    });

    it("returns an organization you belong to", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .get(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: organizationId,
            name: "Acme",
            role: "ADMIN",
            createdAt: expect.any(String) as string,
        });
    });

    it("hides another organization behind a 404", async () => {
        const owner = await signUp("owner@example.com");
        const stranger = await signUp("stranger@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .get(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${stranger.token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Organization not found" });
    });

    it("lets an admin rename an organization", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .patch(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "Acme Corp" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: organizationId,
            name: "Acme Corp",
            role: "ADMIN",
            createdAt: expect.any(String) as string,
        });
    });

    it("returns 403 when a member tries to rename or delete", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await prisma.membership.create({
            data: { userId: member.userId, organizationId, role: "MEMBER" },
        });

        const renamed = await request(app)
            .patch(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ name: "Not Acme" });
        const deleted = await request(app)
            .delete(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(renamed.status).toBe(403);
        expect(deleted.status).toBe(403);
    });

    it("lets a member read the organization", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await prisma.membership.create({
            data: { userId: member.userId, organizationId, role: "MEMBER" },
        });

        const response = await request(app)
            .get(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${member.token}`);
        const body = response.body as { role: string };

        expect(response.status).toBe(200);
        expect(body.role).toBe("MEMBER");
    });

    it("lets an admin delete an organization", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const deleted = await request(app)
            .delete(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        const afterDelete = await request(app)
            .get(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(deleted.status).toBe(204);
        expect(afterDelete.status).toBe(404);
        expect(await prisma.membership.count()).toBe(0);
    });

    it("returns 401 without an access token", async () => {
        const response = await request(app).get("/api/orgs");

        expect(response.status).toBe(401);
    });
});
