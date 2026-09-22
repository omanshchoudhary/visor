import type { RequestHandler } from "express";
import { z } from "zod";

import { config } from "../config.ts";
import { HttpError } from "../errors.ts";
import {
    registerUser,
    rotateRefreshToken,
    startSession,
    verifyCredentials,
} from "../services/auth.ts";

const registerSchema = z.object({
    email: z.email(),
    name: z.string().min(1),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

const refreshCookieSchema = z.object({
    refreshToken: z.string().min(1),
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

export const refresh: RequestHandler = async (req, res) => {
    const cookies = refreshCookieSchema.safeParse(req.cookies);
    if (!cookies.success) {
        throw new HttpError(401, "Invalid refresh token");
    }

    const tokens = await rotateRefreshToken(cookies.data.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        expires: tokens.refreshTokenExpiresAt,
        path: "/api/auth",
    });
    res.status(200).json({ accessToken: tokens.accessToken });
};

export const logout: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
