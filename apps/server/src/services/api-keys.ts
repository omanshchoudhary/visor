import { HttpError } from "../errors.ts";
import type { ApiKeyType } from "../generated/prisma/client.ts";

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

export function createApiKey(
    _actorUserId: string,
    _organizationId: string,
    _projectId: string,
    _input: CreateApiKeyInput,
): Promise<CreatedApiKey> {
    throw new HttpError(501, "Not implemented");
}

export function listApiKeys(
    _actorUserId: string,
    _organizationId: string,
    _projectId: string,
): Promise<ApiKeySummary[]> {
    throw new HttpError(501, "Not implemented");
}

export function revokeApiKey(
    _actorUserId: string,
    _organizationId: string,
    _projectId: string,
    _apiKeyId: string,
): Promise<void> {
    throw new HttpError(501, "Not implemented");
}
