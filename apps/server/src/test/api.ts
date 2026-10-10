import request from "supertest";

import { app } from "../app.ts";
import { prisma } from "../db.ts";
import type { Role } from "../generated/prisma/client.ts";

export type Account = {
    userId: string;
    token: string;
};

export async function signUp(email: string): Promise<Account> {
    const signup = await request(app)
        .post("/api/auth/register")
        .send({ email, name: "Tester", password: "password1" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "password1" });

    return {
        userId: (signup.body as { id: string }).id,
        token: (login.body as { accessToken: string }).accessToken,
    };
}

export async function createOrganization(account: Account, name: string): Promise<string> {
    const response = await request(app)
        .post("/api/orgs")
        .set("Authorization", `Bearer ${account.token}`)
        .send({ name });

    return (response.body as { id: string }).id;
}

export async function addMember(
    account: Account,
    organizationId: string,
    role: Role,
): Promise<void> {
    await prisma.membership.create({ data: { userId: account.userId, organizationId, role } });
}

export async function createProject(
    account: Account,
    organizationId: string,
    name: string,
): Promise<string> {
    const response = await request(app)
        .post(`/api/orgs/${organizationId}/projects`)
        .set("Authorization", `Bearer ${account.token}`)
        .send({ name });

    return (response.body as { id: string }).id;
}
