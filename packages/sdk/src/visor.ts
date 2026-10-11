import type { RequestHandler } from "express";

import { createRequestMiddleware } from "./middleware.ts";
import { createEventQueue } from "./queue.ts";
import { createTransport } from "./transport.ts";

export type VisorOptions = {
    url: string; // base url of the visor server
    key: string; // ingest key for one project
    batchSize?: number; // default 50
    capacity?: number; // default 1000 events held in memory
    flushIntervalMs?: number; // default 5000
    maxRetries?: number; // default 3
    onError?: (error: Error) => void; // called once per outage
};

export type Visor = RequestHandler & {
    close: () => Promise<void>;
};

export function visor(options: VisorOptions): Visor {
    const queue = createEventQueue({
        capacity: options.capacity ?? 1000,
        batchSize: options.batchSize ?? 50,
        flushIntervalMs: options.flushIntervalMs ?? 5000,
        send: createTransport({
            url: options.url,
            key: options.key,
            maxRetries: options.maxRetries,
            onError: options.onError,
        }),
    });

    const middleware = createRequestMiddleware({
        record: (event) => {
            queue.add(event);
        },
    });

    return Object.assign(middleware, { close: () => queue.close() });
}
