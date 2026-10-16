import { describe, expect, it } from "vitest";

import { HttpError } from "../errors.ts";
import { createRateLimiter } from "./rate-limit.ts";

const options = { capacity: 2000, refillPerSecond: 500 };

function thrownBy(run: () => void): unknown {
    try {
        run();
    } catch (error) {
        return error;
    }
    return undefined;
}

describe("createRateLimiter", () => {
    it("lets a batch through while the bucket holds it", () => {
        const limiter = createRateLimiter(options);

        expect(() => limiter.consume("key", 2000, 0)).not.toThrow();
    });

    it("charges the first batch instead of waving it through", () => {
        const limiter = createRateLimiter(options);

        limiter.consume("key", 2000, 0);

        expect(() => limiter.consume("key", 1, 0)).toThrow(HttpError);
    });

    it("refills with the time that passed", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("key", 2000, 0);

        expect(() => limiter.consume("key", 500, 1000)).not.toThrow();
    });

    it("refills part of a second proportionally", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("key", 2000, 0);

        expect(() => limiter.consume("key", 51, 100)).toThrow(HttpError);
        expect(() => limiter.consume("key", 50, 100)).not.toThrow();
    });

    it("never banks more than the burst", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("key", 2000, 0);

        limiter.consume("key", 2000, 3_600_000);

        expect(() => limiter.consume("key", 1, 3_600_000)).toThrow(HttpError);
    });

    it("refuses a batch bigger than the burst however long it waits", () => {
        const limiter = createRateLimiter(options);

        expect(() => limiter.consume("key", 2001, 10_000_000)).toThrow(HttpError);
    });

    it("keeps one bucket per key", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("a", 2000, 0);

        expect(() => limiter.consume("b", 2000, 0)).not.toThrow();
    });

    it("costs nothing to be refused", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("key", 1800, 0);

        expect(() => limiter.consume("key", 500, 0)).toThrow(HttpError);
        expect(() => limiter.consume("key", 200, 0)).not.toThrow();
    });

    it("ignores a clock that runs backwards", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("key", 1500, 10_000);

        expect(() => limiter.consume("key", 500, 5_000)).not.toThrow();
        expect(() => limiter.consume("key", 1, 5_000)).toThrow(HttpError);
    });

    it("answers 429 with the seconds left to wait", () => {
        const limiter = createRateLimiter(options);
        limiter.consume("key", 2000, 0);

        const error = thrownBy(() => limiter.consume("key", 1000, 0));

        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).status).toBe(429);
        expect((error as HttpError).retryAfter).toBe(2);
    });
});
