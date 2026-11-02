import { api } from "./client.ts";

export type ApiKeyType = "INGEST" | "READ";

export type ApiKey = {
    id: string;
    name: string;
    keyPrefix: string;
    type: ApiKeyType;
    lastUsedAt: string | null;
    revokedAt: string | null;
    createdAt: string;
};

export type CreatedApiKey = ApiKey & {
    key: string;
};

export function listApiKeys(organizationId: string, projectId: string): Promise<ApiKey[]> {
    return api.get<ApiKey[]>(`/orgs/${organizationId}/projects/${projectId}/keys`);
}

export function createApiKey(
    organizationId: string,
    projectId: string,
    name: string,
    type: ApiKeyType,
): Promise<CreatedApiKey> {
    return api.post<CreatedApiKey>(`/orgs/${organizationId}/projects/${projectId}/keys`, {
        name,
        type,
    });
}

export function revokeApiKey(
    organizationId: string,
    projectId: string,
    apiKeyId: string,
): Promise<void> {
    return api.delete<void>(`/orgs/${organizationId}/projects/${projectId}/keys/${apiKeyId}`);
}
