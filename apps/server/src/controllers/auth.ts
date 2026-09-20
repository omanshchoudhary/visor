import type { RequestHandler } from "express";
import { z } from "zod";

import { HttpError } from "../errors.ts";
import { registerUser } from "../services/auth.ts";

const registerSchema = z.object({
    email: z.email(),
    name: z.string().min(1),
    password: z.string().min(8),
});

export const register: RequestHandler = async (req, res) => {
    const body = registerSchema.parse(req.body);
    const user = await registerUser(body);
    res.status(201).json(user);
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
