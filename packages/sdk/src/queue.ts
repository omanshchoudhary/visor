import type { RequestEvent } from "@visorhq/contract";

export type SendBatch = (events: RequestEvent[]) => Promise<void>;

export type QueueOptions = {
    capacity: number; // hard ceiling on events held in memory
    batchSize: number; // flush as soon as this many are waiting
    flushIntervalMs: number; // flush this often even when half empty
    send: SendBatch;
};

export type QueueStats = {
    size: number; // events waiting right now
    dropped: number; // events thrown away to stay under capacity
    failed: number; // events lost because a send rejected
};

export type EventQueue = {
    add: (event: RequestEvent) => void;
    flush: () => Promise<void>;
    close: () => Promise<void>;
    stats: () => QueueStats;
};

export function createEventQueue(options: QueueOptions): EventQueue {
    const buffer: RequestEvent[] = [];
    let dropped = 0;
    let failed = 0;
    // held while a drain is running, so a second flush joins it instead of overlapping
    let inFlight: Promise<void> | undefined;
    let closed = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    // the first splice runs before the first await, so add() can drain in its own tick
    async function drain(untilEmpty: boolean): Promise<void> {
        while (buffer.length > 0) {
            const batch = buffer.splice(0, options.batchSize);

            try {
                await options.send(batch);
            } catch {
                failed += batch.length;
                return;
            }

            if (!untilEmpty && buffer.length < options.batchSize) {
                return;
            }
        }
    }

    function flush(): Promise<void> {
        inFlight ??= drain(false).finally(() => {
            inFlight = undefined;
        });

        return inFlight;
    }

    timer = setInterval(() => void flush(), options.flushIntervalMs);
    timer.unref?.();

    return {
        add(event) {
            if (closed) return;

            buffer.push(event);
            if (buffer.length >= options.batchSize) void flush();

            while (buffer.length > options.capacity) {
                buffer.shift();
                dropped++;
            }
        },
        flush,
        async close() {
            closed = true;
            if (timer) clearInterval(timer);
            timer = undefined;

            // let whatever is in flight land, then send the remainder, partial batch and all
            while (inFlight) {
                await inFlight;
            }
            await drain(true);
        },

        stats: () => ({ size: buffer.length, dropped, failed }),
    };
}
