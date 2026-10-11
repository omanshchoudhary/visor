import type { RequestHandler } from "express";
import { z } from "zod";

import { HttpError } from "../errors.ts";
import { storeBatch } from "../services/ingest.ts";

const MAX_BATCH_SIZE = 500;

const eventSchema = z.object({
    id: z.uuid(),
    route: z.string().min(1),
    method: z.string().min(1),
    statusCode: z.number().int().min(100).max(599),
    durationUs: z.number().int().min(0),
    startedAt: z.number().int().positive(),
});

const batchSchema = z.object({
    events: z.array(eventSchema).min(1).max(MAX_BATCH_SIZE),
});

export const ingestEvents: RequestHandler = async (req, res) => {
    const [scheme, key] = req.headers.authorization?.split(" ") ?? [];

    if (scheme?.toLowerCase() !== "bearer" || !key) {
        throw new HttpError(401, "Invalid ingest key");
    }

    const body = batchSchema.parse(req.body);
    const result = await storeBatch(key, body.events);

    res.status(202).json(result);
};
