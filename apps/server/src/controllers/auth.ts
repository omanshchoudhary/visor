import type { RequestHandler } from "express";

import { HttpError } from "../errors.ts";

export const register: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const login: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const refresh: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const logout: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
