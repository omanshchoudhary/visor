import { config } from "../config.ts";
import { HttpError } from "../errors.ts";

export type Bucket = {
    tokens: number;
    lastRefillAt: number;
};

export type RateLimiterOptions = {
    capacity: number;
    refillPerSecond: number;
};

export type RateLimiter = {
    consume: (key: string, cost: number, now?: number) => void;
};

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
    const buckets = new Map<string, Bucket>();

    function consume(key: string, cost: number, now = Date.now()): void {
        const bucket = buckets.get(key) ?? { tokens: options.capacity, lastRefillAt: now };
        const elapsed = Math.max(0, now - bucket.lastRefillAt);
        const tokens = Math.min(
            options.capacity,
            bucket.tokens + (elapsed / 1000) * options.refillPerSecond,
        );

        if (tokens < cost) {
            const retryAfter = Math.ceil((cost - tokens) / options.refillPerSecond);
            throw new HttpError(429, "Rate limit exceeded", retryAfter);
        }

        buckets.set(key, { tokens: tokens - cost, lastRefillAt: now });
    }

    return { consume };
}

export const ingestRateLimiter = createRateLimiter({
    capacity: config.INGEST_BURST,
    refillPerSecond: config.INGEST_EVENTS_PER_SECOND,
});
