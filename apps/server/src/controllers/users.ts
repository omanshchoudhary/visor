import type { RequestHandler } from "express";

import { HttpError } from "../errors.ts";
import { authenticatedUserId } from "../middleware/require-auth.ts";
import { getUserProfile } from "../services/users.ts";

export const getMe: RequestHandler = async (req, res) => {
    const user = await getUserProfile(authenticatedUserId(req));
    res.status(200).json(user);
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
