import { afterEach, describe, expect, it, vi } from "vitest";

import type { RequestEvent } from "@visorhq/contract";

import { createEventQueue, type QueueOptions } from "./queue.ts";

function event(startedAt: number): RequestEvent {
    return {
        route: "/users/:id",
        method: "GET",
        statusCode: 200,
        durationMs: 1,
        startedAt,
    };
}

function deferred(): { promise: Promise<void>; resolve: () => void; reject: () => void } {
    let resolve: () => void = () => undefined;
    let reject: () => void = () => undefined;
    const promise = new Promise<void>((res, rej) => {
        resolve = () => {
            res();
        };
        reject = () => {
            rej(new Error("send failed"));
        };
    });

    return { promise, resolve, reject };
}

function setUp(overrides: Partial<QueueOptions> = {}) {
    const batches: RequestEvent[][] = [];
    const queue = createEventQueue({
        capacity: 10,
        batchSize: 2,
        flushIntervalMs: 1000,
        send: (events) => {
            batches.push(events);
            return Promise.resolve();
        },
        ...overrides,
    });

    return { queue, batches };
}

describe("createEventQueue", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("holds events until the batch size is reached", () => {
        const { queue, batches } = setUp();

        queue.add(event(1));

        expect(batches).toHaveLength(0);
        expect(queue.stats().size).toBe(1);
    });

    it("sends as soon as the batch size is reached", async () => {
        const { queue, batches } = setUp();

        queue.add(event(1));
        queue.add(event(2));
        await vi.waitFor(() => expect(batches).toHaveLength(1));

        expect(batches[0]).toHaveLength(2);
        expect(queue.stats().size).toBe(0);
    });

    it("sends on the timer when the batch is not full", async () => {
        vi.useFakeTimers();
        const { queue, batches } = setUp();

        queue.add(event(1));
        await vi.advanceTimersByTimeAsync(1000);

        expect(batches).toHaveLength(1);
        expect(batches[0]).toHaveLength(1);
    });

    it("drops the oldest events when it cannot drain", () => {
        const blocked = deferred();
        const { queue } = setUp({
            capacity: 4,
            batchSize: 2,
            send: () => blocked.promise,
        });

        for (let index = 1; index <= 8; index += 1) {
            queue.add(event(index));
        }

        expect(queue.stats().size).toBe(4);
        expect(queue.stats().dropped).toBe(2);
        blocked.resolve();
    });

    it("keeps the newest events when it drops", async () => {
        const blocked = deferred();
        const sent: RequestEvent[][] = [];
        const queue = createEventQueue({
            capacity: 3,
            batchSize: 2,
            flushIntervalMs: 1000,
            send: async (events) => {
                sent.push(events);
                await blocked.promise;
            },
        });

        for (let index = 1; index <= 7; index += 1) {
            queue.add(event(index));
        }

        expect(queue.stats().size).toBe(3);
        blocked.resolve();
        await vi.waitFor(() => expect(sent).toHaveLength(1));
    });

    it("does not start a second send while one is in flight", async () => {
        const blocked = deferred();
        const sent: RequestEvent[][] = [];
        const queue = createEventQueue({
            capacity: 100,
            batchSize: 2,
            flushIntervalMs: 1000,
            send: async (events) => {
                sent.push(events);
                await blocked.promise;
            },
        });

        queue.add(event(1));
        queue.add(event(2));
        queue.add(event(3));
        queue.add(event(4));
        await Promise.resolve();

        expect(sent).toHaveLength(1);

        blocked.resolve();
        await vi.waitFor(() => expect(sent).toHaveLength(2));
    });

    it("never lets a failing send escape add", async () => {
        const { queue } = setUp({
            send: () => Promise.reject(new Error("visor is down")),
        });

        expect(() => {
            queue.add(event(1));
            queue.add(event(2));
        }).not.toThrow();

        await vi.waitFor(() => expect(queue.stats().failed).toBe(2));
    });

    it("stops after a failed send instead of burning the buffer", async () => {
        let calls = 0;
        const { queue } = setUp({
            capacity: 100,
            batchSize: 2,
            send: () => {
                calls += 1;
                return Promise.reject(new Error("visor is down"));
            },
        });

        for (let index = 1; index <= 10; index += 1) {
            queue.add(event(index));
        }
        await vi.waitFor(() => expect(calls).toBeGreaterThan(0));
        await new Promise((resolve) => setTimeout(resolve, 20));

        expect(calls).toBe(1);
        expect(queue.stats().size).toBe(8);
    });

    it("drains everything on close", async () => {
        const { queue, batches } = setUp({ capacity: 100, batchSize: 2, flushIntervalMs: 60_000 });

        queue.add(event(1));
        queue.add(event(2));
        queue.add(event(3));
        queue.add(event(4));
        queue.add(event(5));
        await queue.close();

        expect(queue.stats().size).toBe(0);
        expect(batches.flat()).toHaveLength(5);
    });

    it("gives up on close when sending keeps failing", async () => {
        const { queue } = setUp({
            send: () => Promise.reject(new Error("visor is down")),
        });

        queue.add(event(1));
        await queue.close();

        expect(queue.stats().size).toBe(0);
    });

    it("ignores events added after close", async () => {
        const { queue, batches } = setUp();

        await queue.close();
        queue.add(event(1));
        queue.add(event(2));

        expect(queue.stats().size).toBe(0);
        expect(batches).toHaveLength(0);
    });
});
