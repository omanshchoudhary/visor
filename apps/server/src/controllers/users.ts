import type { RequestHandler } from "express";
import { z } from "zod";

import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "../cookies.ts";
import { authenticatedUserId } from "../middleware/require-auth.ts";
import * as users from "../services/users.ts";

const updateMeSchema = z.object({
    name: z.string().min(1),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});

export const getMe: RequestHandler = async (req, res) => {
    const user = await users.getUserProfile(authenticatedUserId(req));
    res.status(200).json(user);
};

export const updateMe: RequestHandler = async (req, res) => {
    const body = updateMeSchema.parse(req.body);
    const user = await users.updateUserProfile(authenticatedUserId(req), body);
    res.status(200).json(user);
};

export const changeMyPassword: RequestHandler = async (req, res) => {
    const body = changePasswordSchema.parse(req.body);
    await users.changePassword(authenticatedUserId(req), body);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    res.status(204).send();
};

export const deleteMe: RequestHandler = async (req, res) => {
    await users.deleteUser(authenticatedUserId(req));
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    res.status(204).send();
};
