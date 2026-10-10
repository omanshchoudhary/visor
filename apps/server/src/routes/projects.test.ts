import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.ts";
import { addMember, createOrganization, createProject, signUp } from "../test/api.ts";
import { resetDatabase } from "../test/database.ts";

describe("project routes", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it("creates a project", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .post(`/api/orgs/${organizationId}/projects`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "checkout-api" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            id: expect.any(String) as string,
            name: "checkout-api",
            organizationId,
            createdAt: expect.any(String) as string,
        });
    });

    it("rejects a duplicate name in the same organization", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await createProject(owner, organizationId, "checkout-api");

        const response = await request(app)
            .post(`/api/orgs/${organizationId}/projects`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "checkout-api" });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ error: "Project name already taken" });
    });

    it("allows the same name in a different organization", async () => {
        const owner = await signUp("owner@example.com");
        const first = await createOrganization(owner, "Acme");
        const second = await createOrganization(owner, "Globex");
        await createProject(owner, first, "checkout-api");

        const response = await request(app)
            .post(`/api/orgs/${second}/projects`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "checkout-api" });

        expect(response.status).toBe(201);
    });

    it("returns 400 for a blank name", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app)
            .post(`/api/orgs/${organizationId}/projects`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ name: "" });

        expect(response.status).toBe(400);
    });

    it("lists only the projects in that organization", async () => {
        const owner = await signUp("owner@example.com");
        const first = await createOrganization(owner, "Acme");
        const second = await createOrganization(owner, "Globex");
        await createProject(owner, first, "checkout-api");
        await createProject(owner, first, "search-api");
        await createProject(owner, second, "billing-api");

        const response = await request(app)
            .get(`/api/orgs/${first}/projects`)
            .set("Authorization", `Bearer ${owner.token}`);
        const body = response.body as { name: string }[];

        expect(response.status).toBe(200);
        expect(body.map((project) => project.name)).toEqual(["checkout-api", "search-api"]);
    });

    it("hides a project belonging to another organization", async () => {
        const owner = await signUp("owner@example.com");
        const stranger = await signUp("stranger@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        const strangerOrganizationId = await createOrganization(stranger, "Initech");
        const projectId = await createProject(owner, organizationId, "checkout-api");

        const throughOwnOrganization = await request(app)
            .get(`/api/orgs/${strangerOrganizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${stranger.token}`);
        const throughOtherOrganization = await request(app)
            .get(`/api/orgs/${organizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${stranger.token}`);

        expect(throughOwnOrganization.status).toBe(404);
        expect(throughOwnOrganization.body).toEqual({ error: "Project not found" });
        expect(throughOtherOrganization.status).toBe(404);
        expect(throughOtherOrganization.body).toEqual({ error: "Organization not found" });
    });

    it("lets a viewer read but not create", async () => {
        const owner = await signUp("owner@example.com");
        const viewer = await signUp("viewer@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(viewer, organizationId, "VIEWER");
        await createProject(owner, organizationId, "checkout-api");

        const listed = await request(app)
            .get(`/api/orgs/${organizationId}/projects`)
            .set("Authorization", `Bearer ${viewer.token}`);
        const created = await request(app)
            .post(`/api/orgs/${organizationId}/projects`)
            .set("Authorization", `Bearer ${viewer.token}`)
            .send({ name: "search-api" });

        expect(listed.status).toBe(200);
        expect(created.status).toBe(403);
    });

    it("lets a member rename but not delete", async () => {
        const owner = await signUp("owner@example.com");
        const member = await signUp("member@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        await addMember(member, organizationId, "MEMBER");
        const projectId = await createProject(owner, organizationId, "checkout-api");

        const renamed = await request(app)
            .patch(`/api/orgs/${organizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${member.token}`)
            .send({ name: "orders-api" });
        const deleted = await request(app)
            .delete(`/api/orgs/${organizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${member.token}`);

        expect(renamed.status).toBe(200);
        expect((renamed.body as { name: string }).name).toBe("orders-api");
        expect(deleted.status).toBe(403);
    });

    it("lets an admin delete a project", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");
        const projectId = await createProject(owner, organizationId, "checkout-api");

        const deleted = await request(app)
            .delete(`/api/orgs/${organizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        const afterDelete = await request(app)
            .get(`/api/orgs/${organizationId}/projects/${projectId}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(deleted.status).toBe(204);
        expect(afterDelete.status).toBe(404);
    });

    it("returns 401 without an access token", async () => {
        const owner = await signUp("owner@example.com");
        const organizationId = await createOrganization(owner, "Acme");

        const response = await request(app).get(`/api/orgs/${organizationId}/projects`);

        expect(response.status).toBe(401);
    });
});
