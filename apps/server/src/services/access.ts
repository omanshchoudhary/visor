import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import type { ApiKeyType, Role } from "../generated/prisma/client.ts";
import { hashToken } from "./tokens.ts";

const roleRank: Record<Role, number> = {
    VIEWER: 0,
    MEMBER: 1,
    ADMIN: 2,
};

export async function requireMembership(
    userId: string,
    organizationId: string,
    minimum: Role,
): Promise<Role> {
    const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId, organizationId } },
        select: { role: true },
    });

    if (membership === null) {
        throw new HttpError(404, "Organization not found");
    }

    if (roleRank[membership.role] < roleRank[minimum]) {
        throw new HttpError(403, "Forbidden");
    }

    return membership.role;
}

export type AuthenticatedApiKey = {
    apiKeyId: string;
    projectId: string;
};

// the same lookup serves ingest keys and the read keys mcp will use
export async function authenticateApiKey(
    rawKey: string,
    type: ApiKeyType,
): Promise<AuthenticatedApiKey> {
    const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash: hashToken(rawKey) },
        select: { id: true, projectId: true, type: true, revokedAt: true },
    });

    // unknown, revoked and wrong type all answer the same, so a caller learns nothing
    if (apiKey === null || apiKey.revokedAt !== null || apiKey.type !== type) {
        throw new HttpError(401, "Invalid api key");
    }

    return { apiKeyId: apiKey.id, projectId: apiKey.projectId };
}
