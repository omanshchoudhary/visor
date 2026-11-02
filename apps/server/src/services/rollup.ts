import { prisma } from "../db.ts";

export type RollupEvent = {
    route: string;
    method: string;
    statusCode: number;
    durationUs: number;
    startedAt: Date;
};

export type RouteMinuteRow = {
    projectId: string;
    route: string;
    method: string;
    minute: Date;
    requests: number;
    clientErrors: number;
    serverErrors: number;
    durationSumUs: bigint;
    durationMaxUs: number;
    latency: number[];
};

// upper edge of each band in microseconds, last band catches everything slower
export const LATENCY_BANDS = [
    1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000, 128_000, 256_000, 512_000, 1_024_000,
    2_048_000, 4_096_000, 8_192_000, 16_384_000, 32_768_000,
] as const;

export const BAND_COUNT = LATENCY_BANDS.length + 1;

// Picks the slot a single request falls in, so durations become counts instead of a list.
export function bandFor(durationUs: number): number {
    for (const [band, edge] of LATENCY_BANDS.entries()) {
        if (durationUs <= edge) {
            return band;
        }
    }

    return BAND_COUNT - 1;
}

// Example: 2026-11-02 15:30:38.749 becomes 2026-11-02 15:30:00.000.
export function floorToMinute(at: Date): Date {
    const minute = new Date(at);
    minute.setSeconds(0, 0);
    return minute;
}

// Adds the bands position by position, so a range of minutes reads as one histogram.
export function mergeLatency(histograms: number[][]): number[] {
    const merged = new Array<number>(BAND_COUNT).fill(0);

    for (const histogram of histograms) {
        for (let band = 0; band < BAND_COUNT; band += 1) {
            merged[band] = (merged[band] ?? 0) + (histogram[band] ?? 0);
        }
    }

    return merged;
}

const SLOWEST_BAND = LATENCY_BANDS[LATENCY_BANDS.length - 1] ?? 0;

// Walks the bands until the quantile is crossed, so the answer is that band's upper edge.
export function percentile(latency: number[], quantile: number): number {
    const total = latency.reduce((sum, count) => sum + count, 0);

    if (total === 0) {
        return 0;
    }

    const target = quantile * total;
    let seen = 0;

    for (let band = 0; band < latency.length; band += 1) {
        seen += latency[band] ?? 0;

        if (seen >= target) {
            // the overflow band has no edge of its own, so it reports the slowest one
            return LATENCY_BANDS[band] ?? SLOWEST_BAND;
        }
    }

    return SLOWEST_BAND;
}

// One row per route, method and minute, so events of the same group fold into each other.
export function rollEvents(projectId: string, events: RollupEvent[]): RouteMinuteRow[] {
    const routeMinutes = new Map<string, RouteMinuteRow>();

    for (const event of events) {
        const minute = floorToMinute(event.startedAt);
        const key = `${event.method} ${event.route} ${String(minute.getTime())}`;

        let row = routeMinutes.get(key);

        if (row === undefined) {
            row = {
                projectId,
                route: event.route,
                method: event.method,
                minute,
                requests: 0,
                clientErrors: 0,
                serverErrors: 0,
                durationSumUs: 0n,
                durationMaxUs: 0,
                latency: new Array<number>(BAND_COUNT).fill(0),
            };
            routeMinutes.set(key, row);
        }

        const band = bandFor(event.durationUs);

        row.requests += 1;
        row.clientErrors += event.statusCode >= 400 && event.statusCode < 500 ? 1 : 0;
        row.serverErrors += event.statusCode >= 500 ? 1 : 0;
        row.durationSumUs += BigInt(event.durationUs);
        row.durationMaxUs = Math.max(row.durationMaxUs, event.durationUs);
        row.latency[band] = (row.latency[band] ?? 0) + 1;
    }

    return [...routeMinutes.values()];
}

// Recomputes the minute from scratch, so running it again lands on the same rows.
export async function rollupMinute(minute: Date): Promise<number> {
    const from = floorToMinute(minute);
    const to = new Date(from.getTime() + 60_000);

    const events = await prisma.event.findMany({
        where: { startedAt: { gte: from, lt: to } },
        select: {
            projectId: true,
            route: true,
            method: true,
            statusCode: true,
            durationUs: true,
            startedAt: true,
        },
    });

    const byProject = new Map<string, RollupEvent[]>();

    for (const event of events) {
        const forProject = byProject.get(event.projectId) ?? [];

        forProject.push(event);
        byProject.set(event.projectId, forProject);
    }

    const rows = [...byProject].flatMap(([projectId, forProject]) =>
        rollEvents(projectId, forProject),
    );

    await prisma.$transaction([
        prisma.routeMinute.deleteMany({ where: { minute: from } }),
        prisma.routeMinute.createMany({ data: rows }),
    ]);

    return rows.length;
}
