import type { RequestHandler } from "express";

import type { RequestEvent } from "@visorhq/contract";

import { routeTemplate } from "./route.ts";

export type RecordEvent = (event: RequestEvent) => void;

export type Clock = {
    wallClock: () => number;
    monotonic: () => bigint;
};

export type RequestMiddlewareOptions = {
    record: RecordEvent;
    clock?: Clock;
};

export function createRequestMiddleware(options: RequestMiddlewareOptions): RequestHandler {
    const clock = options.clock ?? {
        wallClock: () => Date.now(),
        monotonic: () => process.hrtime.bigint(),
    };

    return (req, res, next) => {
        const startMonotonic = clock.monotonic();
        const startedAt = clock.wallClock();
        let recorded = false;

        // finish covers a sent response, close covers a client that hung up
        const emitTelemetry = () => {
            if (recorded) {
                return;
            }
            recorded = true;

            const endMonotonic = clock.monotonic();

            options.record({
                startedAt,
                route: routeTemplate(req),
                method: req.method,
                statusCode: res.statusCode,
                durationMs: Number(endMonotonic - startMonotonic) / 1e6,
            });
        };

        res.once("finish", emitTelemetry);
        res.once("close", emitTelemetry);

        next();
    };
}
