import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import { addMember, createOrganization, signUp } from "../test/api.ts";
import { resetDatabase } from "../test/database.ts";

describe("member routes", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("lists members with their user details", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const response = await request(app)
            .get(`/api/orgs/${organizationId}/members`)
            .set("Authorization", `Bearer ${owner.token}`);
        const body = response.body as { userId: string; email: string; role: string }[];

        expect(response.status).toBe(200);
        expect(body).toHaveLength(2);
        expect(body[0]).toEqual({
            userId: owner.userId,
            email: "owner@example.com",
            name: "Tester",
            role: "ADMIN",
            createdAt: expect.any(String) as string,
        });
        expect(body[1]?.role).toBe("MEMBER");
    });

    it("lets an admin promote a member", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const response = await request(app)
            .patch(`/api/orgs/${organizationId}/members/${member.userId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ role: "ADMIN" });
        const body = response.body as { role: string; userId: string };

        expect(response.status).toBe(200);
        expect(body.userId).toBe(member.userId);
        expect(body.role).toBe("ADMIN");
    });

    it("stops a member changing roles", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const response = await request(app)
            .patch(`/api/orgs/${organizationId}/members/${owner.userId}`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ role: "VIEWER" });

        expect(response.status).toBe(403);
    });

    it("refuses to demote the only admin", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .patch(`/api/orgs/${organizationId}/members/${owner.userId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ role: "MEMBER" });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ error: "The last admin cannot be demoted" });
    });

    it("allows demoting an admin while another remains", async () => {
        const owner = await signUp("owner@example.com");
        const second = await signUp("second@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(second, organizationId, "ADMIN");

        const response = await request(app)
            .patch(`/api/orgs/${organizationId}/members/${second.userId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ role: "VIEWER" });

        expect(response.status).toBe(200);
        expect((response.body as { role: string }).role).toBe("VIEWER");
    });

    it("refuses to remove the only admin", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .delete(`/api/orgs/${organizationId}/members/${owner.userId}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ error: "The last admin cannot be removed" });
    });

    it("lets an admin remove a member", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const removed = await request(app)
            .delete(`/api/orgs/${organizationId}/members/${member.userId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        const afterRemoval = await request(app)
            .get(`/api/orgs/${organizationId}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(removed.status).toBe(204);
        expect(afterRemoval.status).toBe(404);
    });

    it("lets a member leave on their own", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");

        const left = await request(app)
            .delete(`/api/orgs/${organizationId}/members/${member.userId}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(left.status).toBe(204);
    });

    it("stops a member removing someone else", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const other = await signUp("other@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");
        await addMember(other, organizationId, "MEMBER");

        const response = await request(app)
            .delete(`/api/orgs/${organizationId}/members/${other.userId}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(response.status).toBe(403);
    });

    it("keeps one admin when two demotions race", async () => {
        const owner = await signUp("owner@example.com");
        const second = await signUp("second@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(second, organizationId, "ADMIN");

        const [first, last] = await Promise.all([
            request(app)
                .patch(`/api/orgs/${organizationId}/members/${owner.userId}`)
                .set("Authorization", `Bearer ${owner.token}`)
                .send({ role: "MEMBER" }),
            request(app)
                .patch(`/api/orgs/${organizationId}/members/${second.userId}`)
                .set("Authorization", `Bearer ${second.token}`)
                .send({ role: "MEMBER" }),
        ]);

        const admins = await prisma.membership.count({
            where: { organizationId, role: "ADMIN" },
        });

        expect([first.status, last.status].sort()).toEqual([200, 409]);
        expect(admins).toBe(1);
    });

    it("returns 404 for someone who is not a member", async () => {
        const owner = await signUp("owner@example.com");
        const stranger = await signUp("stranger@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .delete(`/api/orgs/${organizationId}/members/${stranger.userId}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Member not found" });
    });

    it("hides the member list from another organization", async () => {
        const owner = await signUp("owner@example.com");
        const stranger = await signUp("stranger@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .get(`/api/orgs/${organizationId}/members`)
            .set("Authorization", `Bearer ${stranger.token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Organization not found" });
    });

    it("returns 401 without an access token", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app).get(`/api/orgs/${organizationId}/members`);

        expect(response.status).toBe(401);
    });
});
