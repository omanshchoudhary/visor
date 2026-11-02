import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "../logger.ts";
import { rollupMinute } from "./rollup.ts";
import { createScheduler, minutesToRoll } from "./scheduler.ts";

vi.mock("./rollup.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./rollup.ts")>()),
    rollupMinute: vi.fn(),
}));

vi.mock("../logger.ts", () => ({ logger: { error: vi.fn() } }));

const rolled = vi.mocked(rollupMinute);
const logged = vi.mocked(logger.error);

const options = { intervalMs: 60_000, lagMinutes: 3 };

function at(time: string): Date {
    return new Date(`2026-11-02T${time}Z`);
}

describe("minutesToRoll", () => {
    it("answers with the closed minutes behind now, oldest first", () => {
        expect(minutesToRoll(at("14:23:05.000"), 3)).toEqual([
            at("14:20:00.000"),
            at("14:21:00.000"),
            at("14:22:00.000"),
        ]);
    });

    it("leaves the open minute alone", () => {
        expect(minutesToRoll(at("14:23:59.999"), 1)).toEqual([at("14:22:00.000")]);
    });

    it("ignores the seconds on the clock", () => {
        expect(minutesToRoll(at("14:23:00.000"), 1)).toEqual(minutesToRoll(at("14:23:59.999"), 1));
    });

    it("answers with nothing when the window is empty", () => {
        expect(minutesToRoll(at("14:23:05.000"), 0)).toEqual([]);
    });
});

describe("createScheduler", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        rolled.mockReset();
        rolled.mockResolvedValue(0);
        logged.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("rolls every minute in the window and sums the rows", async () => {
        rolled.mockResolvedValueOnce(2).mockResolvedValueOnce(3).mockResolvedValueOnce(4);

        const scheduler = createScheduler(options);

        await expect(scheduler.tick(at("14:23:05.000"))).resolves.toBe(9);
        expect(rolled).toHaveBeenCalledTimes(3);
        expect(rolled.mock.calls.map(([minute]) => minute)).toEqual([
            at("14:20:00.000"),
            at("14:21:00.000"),
            at("14:22:00.000"),
        ]);
    });

    it("joins a tick that is already running instead of overlapping it", async () => {
        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        const first = scheduler.tick(at("14:23:05.000"));
        const second = scheduler.tick(at("14:23:05.000"));

        expect(second).toBe(first);
        await first;
        expect(rolled).toHaveBeenCalledTimes(1);
    });

    it("runs again once the earlier tick has finished", async () => {
        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        await scheduler.tick(at("14:23:05.000"));
        await scheduler.tick(at("14:24:05.000"));

        expect(rolled).toHaveBeenCalledTimes(2);
    });

    it("ticks on the interval once started", async () => {
        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        scheduler.start();

        await vi.advanceTimersByTimeAsync(180_000);
        scheduler.stop();

        expect(rolled).toHaveBeenCalledTimes(3);
    });

    it("does not tick before the first interval elapses", () => {
        const scheduler = createScheduler(options);

        scheduler.start();
        scheduler.stop();

        expect(rolled).not.toHaveBeenCalled();
    });

    it("keeps one timer when it is started twice", async () => {
        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        scheduler.start();
        scheduler.start();

        await vi.advanceTimersByTimeAsync(60_000);
        scheduler.stop();

        expect(rolled).toHaveBeenCalledTimes(1);
    });

    it("stops ticking once stopped", async () => {
        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        scheduler.start();
        await vi.advanceTimersByTimeAsync(60_000);
        scheduler.stop();
        await vi.advanceTimersByTimeAsync(300_000);

        expect(rolled).toHaveBeenCalledTimes(1);
    });

    it("survives a rollup that throws and keeps ticking", async () => {
        rolled.mockRejectedValueOnce(new Error("database is down"));

        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        scheduler.start();
        await vi.advanceTimersByTimeAsync(120_000);
        scheduler.stop();

        expect(rolled).toHaveBeenCalledTimes(2);
        expect(logged).toHaveBeenCalledTimes(1);
        expect(logged.mock.calls[0]?.[1]).toBe("rollup tick failed");
    });

    it("hands a failure to the caller that asked for the tick", async () => {
        rolled.mockRejectedValueOnce(new Error("database is down"));

        const scheduler = createScheduler({ ...options, lagMinutes: 1 });

        await expect(scheduler.tick(at("14:23:05.000"))).rejects.toThrow("database is down");
        await expect(scheduler.tick(at("14:23:05.000"))).resolves.toBe(0);
    });

    it("stops cleanly when it was never started", () => {
        expect(() => {
            createScheduler(options).stop();
        }).not.toThrow();
    });
});
