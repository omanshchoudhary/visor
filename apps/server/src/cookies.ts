import type { CookieOptions } from "express";

import { config } from "./config.ts";

export const REFRESH_COOKIE_NAME = "refreshToken";

// clearCookie only matches when these are identical to the ones used to set it
export const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: config.NODE_ENV === "production",
    path: "/api/auth",
};
