import type { RequestHandler } from "express";

import { HttpError } from "../errors.ts";

export const getMe: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const updateMe: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const changeMyPassword: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const deleteMe: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
