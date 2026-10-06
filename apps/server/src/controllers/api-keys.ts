import type { RequestHandler } from "express";

import { HttpError } from "../errors.ts";

export const createApiKey: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const listApiKeys: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const revokeApiKey: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
