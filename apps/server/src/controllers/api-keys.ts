import type { RequestHandler } from "express";
import { z } from "zod";

import { authenticatedUserId } from "../middleware/require-auth.ts";
import * as apiKeys from "../services/api-keys.ts";

type ProjectParams = {
    organizationId: string;
    projectId: string;
};

type ApiKeyParams = ProjectParams & {
    apiKeyId: string;
};

const createApiKeySchema = z.object({
    name: z.string().min(1),
    type: z.enum(["INGEST", "READ"]),
});

export const createApiKey: RequestHandler<ProjectParams> = async (req, res) => {
    const body = createApiKeySchema.parse(req.body);
    const apiKey = await apiKeys.createApiKey(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.projectId,
        body,
    );
    res.status(201).json(apiKey);
};

export const listApiKeys: RequestHandler<ProjectParams> = async (req, res) => {
    const list = await apiKeys.listApiKeys(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.projectId,
    );
    res.status(200).json(list);
};

export const revokeApiKey: RequestHandler<ApiKeyParams> = async (req, res) => {
    await apiKeys.revokeApiKey(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.projectId,
        req.params.apiKeyId,
    );
    res.status(204).send();
};
