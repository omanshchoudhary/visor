import type { ErrorRequestHandler, RequestHandler } from "express";
import { STATUS_CODES } from "node:http";
import { z } from "zod";

import { HttpError } from "../errors.ts";

function clientErrorStatus(error: unknown): number | undefined {
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number" &&
        error.status >= 400 &&
        error.status < 500
    ) {
        return error.status;
    }
    return undefined;
}

export const notFound: RequestHandler = (_req, res) => {
    res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
    if (error instanceof z.ZodError) {
        res.status(400).json({
            error: "Invalid request",
            fields: z.flattenError(error).fieldErrors,
        });
        return;
    }
    if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
    }
    const status = clientErrorStatus(error);
    if (status !== undefined) {
        res.status(status).json({ error: STATUS_CODES[status] ?? "Bad request" });
        return;
    }
    req.log.error({ err: error }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
};
