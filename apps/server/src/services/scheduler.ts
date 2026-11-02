import { logger } from "../logger.ts";
import { floorToMinute, rollupMinute } from "./rollup.ts";

export type SchedulerOptions = {
    intervalMs: number; // how often a tick fires
    lagMinutes: number; // how many closed minutes each tick recomputes
};

export type Scheduler = {
    tick: (now?: Date) => Promise<number>;
    start: () => void;
    stop: () => void;
};

const MINUTE_MS = 60_000;

// The closed minutes behind now, oldest first, so the open one is left to finish.
export function minutesToRoll(now: Date, lagMinutes: number): Date[] {
    const current = floorToMinute(now).getTime();
    const minutes: Date[] = [];

    for (let back = lagMinutes; back >= 1; back -= 1) {
        minutes.push(new Date(current - back * MINUTE_MS));
    }

    return minutes;
}

export function createScheduler(options: SchedulerOptions): Scheduler {
    let timer: ReturnType<typeof setInterval> | undefined;
    // held while a tick is running, so the next one joins it instead of overlapping
    let inFlight: Promise<number> | undefined;

    async function roll(now: Date): Promise<number> {
        let rows = 0;

        for (const minute of minutesToRoll(now, options.lagMinutes)) {
            rows += await rollupMinute(minute);
        }

        return rows;
    }

    // Rolls every closed minute in the window and answers with the rows written.
    function tick(now = new Date()): Promise<number> {
        inFlight ??= roll(now).finally(() => {
            inFlight = undefined;
        });

        return inFlight;
    }

    // Starts the timer, and starting one that already runs changes nothing.
    function start(): void {
        timer ??= setInterval(() => {
            tick().catch((error: unknown) => {
                logger.error({ error }, "rollup tick failed");
            });
        }, options.intervalMs);
    }

    // Stops the timer so a shutdown does not leave a tick behind.
    function stop(): void {
        if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
        }
    }

    return { tick, start, stop };
}
