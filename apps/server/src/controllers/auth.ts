import type { RequestHandler } from "express";
import { z } from "zod";

import { config } from "../config.ts";
import { HttpError } from "../errors.ts";
import { registerUser, startSession, verifyCredentials } from "../services/auth.ts";

const registerSchema = z.object({
    email: z.email(),
    name: z.string().min(1),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const register: RequestHandler = async (req, res) => {
    const body = registerSchema.parse(req.body);
    const user = await registerUser(body);
    res.status(201).json(user);
};

export const login: RequestHandler = async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await verifyCredentials(body);
    const tokens = await startSession(user.id);
    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        expires: tokens.refreshTokenExpiresAt,
        path: "/api/auth",
    });
    res.status(200).json({ user, accessToken: tokens.accessToken });
};

export const refresh: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const logout: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
