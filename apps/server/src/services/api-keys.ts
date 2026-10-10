import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import type { ApiKeyType } from "../generated/prisma/client.ts";
import { requireMembership } from "./access.ts";
import { requireProject } from "./projects.ts";
import { hashToken, randomToken } from "./tokens.ts";

export type ApiKeySummary = {
    id: string;
    name: string;
    keyPrefix: string;
    type: ApiKeyType;
    lastUsedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
};

export type CreatedApiKey = ApiKeySummary & {
    key: string;
};

export type CreateApiKeyInput = {
    name: string;
    type: ApiKeyType;
};

const PREFIX_LENGTH = 8;

const apiKeyFields = {
    id: true,
    name: true,
    keyPrefix: true,
    type: true,
    lastUsedAt: true,
    revokedAt: true,
    createdAt: true,
} as const;

// the only time the raw key exists; everything after this reads the hash
function mintKey(type: ApiKeyType): { key: string; keyHash: string; keyPrefix: string } {
    const label = type === "INGEST" ? "ingest" : "read";
    const key = `visor_${label}_${randomToken(24)}`;

    return {
        key,
        keyHash: hashToken(key),
        keyPrefix: key.slice(0, `visor_${label}_`.length + PREFIX_LENGTH),
    };
}

async function requireApiKey(projectId: string, apiKeyId: string): Promise<{ id: string }> {
    const apiKey = await prisma.apiKey.findFirst({
        where: { id: apiKeyId, projectId },
        select: { id: true },
    });

    if (apiKey === null) {
        throw new HttpError(404, "API key not found");
    }

    return apiKey;
}

export async function createApiKey(
    actorUserId: string,
    organizationId: string,
    projectId: string,
    input: CreateApiKeyInput,
): Promise<CreatedApiKey> {
    await requireMembership(actorUserId, organizationId, "ADMIN");
    await requireProject(organizationId, projectId);

    const { key, keyHash, keyPrefix } = mintKey(input.type);
    const created = await prisma.apiKey.create({
        data: {
            name: input.name,
            type: input.type,
            projectId,
            keyHash,
            keyPrefix,
        },
        select: apiKeyFields,
    });

    return { ...created, key };
}

export async function listApiKeys(
    actorUserId: string,
    organizationId: string,
    projectId: string,
): Promise<ApiKeySummary[]> {
    await requireMembership(actorUserId, organizationId, "MEMBER");
    await requireProject(organizationId, projectId);

    return prisma.apiKey.findMany({
        where: { projectId },
        select: apiKeyFields,
        orderBy: { createdAt: "asc" },
    });
}

export async function revokeApiKey(
    actorUserId: string,
    organizationId: string,
    projectId: string,
    apiKeyId: string,
): Promise<void> {
    await requireMembership(actorUserId, organizationId, "ADMIN");
    await requireProject(organizationId, projectId);
    await requireApiKey(projectId, apiKeyId);

    await prisma.apiKey.updateMany({
        where: { id: apiKeyId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
