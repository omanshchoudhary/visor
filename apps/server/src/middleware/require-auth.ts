import type { NextFunction, Request, Response } from "express";
import { errors, jwtVerify } from "jose";

import { config } from "../config.ts";
import { HttpError } from "../errors.ts";

const authSecret = new TextEncoder().encode(config.AUTH_SECRET);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
        if (scheme?.toLowerCase() !== "bearer" || !token) {
            throw new HttpError(401, "Invalid request!");
        }

        const { payload } = await jwtVerify(token, authSecret, { algorithms: ["HS256"] });
        const userId = payload.sub;
        const sessionId = payload.sid;
        if (typeof userId !== "string" || typeof sessionId !== "string") {
            throw new HttpError(401, "Invalid request!");
        }

        req.userId = userId;
        req.sessionId = sessionId;
        next();
    } catch (error) {
        if (!(error instanceof HttpError || error instanceof errors.JOSEError)) {
            throw error;
        }
        res.status(401).json({
            error: "Invalid request!",
        });
    }
}
