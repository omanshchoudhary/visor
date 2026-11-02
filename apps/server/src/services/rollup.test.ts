import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../db.ts";
import { createOrganization, createProject, signUp } from "../test/api.ts";
import { resetDatabase } from "../test/database.ts";
import {
    BAND_COUNT,
    LATENCY_BANDS,
    bandFor,
    floorToMinute,
    mergeLatency,
    percentile,
    rollEvents,
    rollupMinute,
} from "./rollup.ts";
import type { RollupEvent } from "./rollup.ts";

const minute = new Date("2026-11-02T14:23:00.000Z");

function histogram(counts: Record<number, number>): number[] {
    const bands = new Array<number>(BAND_COUNT).fill(0);

    for (const [band, count] of Object.entries(counts)) {
        bands[Number(band)] = count;
    }

    return bands;
}

function event(overrides: Partial<RollupEvent> = {}): RollupEvent {
    return {
        route: "/orders/:id",
        method: "GET",
        statusCode: 200,
        durationUs: 12_500,
        startedAt: new Date("2026-11-02T14:23:47.391Z"),
        ...overrides,
    };
}

describe("bandFor", () => {
    it("puts a duration in the first band it fits under", () => {
        expect(bandFor(1)).toBe(0);
        expect(bandFor(1_000)).toBe(0);
        expect(bandFor(1_001)).toBe(1);
        expect(bandFor(12_500)).toBe(4);
    });

    it("sends anything slower than the last edge to the overflow band", () => {
        expect(bandFor(32_768_000)).toBe(LATENCY_BANDS.length - 1);
        expect(bandFor(32_768_001)).toBe(BAND_COUNT - 1);
        expect(bandFor(Number.MAX_SAFE_INTEGER)).toBe(BAND_COUNT - 1);
    });
});

describe("floorToMinute", () => {
    it("drops the seconds and milliseconds", () => {
        expect(floorToMinute(new Date("2026-11-02T14:23:47.391Z"))).toEqual(minute);
    });

    it("leaves a time that is already on the minute alone", () => {
        expect(floorToMinute(minute)).toEqual(minute);
    });

    it("does not mutate the date it was given", () => {
        const at = new Date("2026-11-02T14:23:47.391Z");

        floorToMinute(at);

        expect(at.getUTCSeconds()).toBe(47);
    });
});

describe("mergeLatency", () => {
    it("adds the bands position by position", () => {
        const merged = mergeLatency([histogram({ 0: 1, 4: 2 }), histogram({ 4: 3, 9: 1 })]);

        expect(merged).toEqual(histogram({ 0: 1, 4: 5, 9: 1 }));
    });

    it("answers with an empty histogram when there is nothing to merge", () => {
        expect(mergeLatency([])).toEqual(new Array<number>(BAND_COUNT).fill(0));
    });
});

describe("percentile", () => {
    it("reports the band the quantile lands in", () => {
        const latency = histogram({ 0: 90, 7: 10 });

        expect(percentile(latency, 0.5)).toBe(LATENCY_BANDS[0]);
        expect(percentile(latency, 0.95)).toBe(LATENCY_BANDS[7]);
    });

    it("reports the slowest edge when the quantile lands in the overflow band", () => {
        expect(percentile(histogram({ [BAND_COUNT - 1]: 5 }), 0.99)).toBe(
            LATENCY_BANDS[LATENCY_BANDS.length - 1],
        );
    });

    it("answers zero for a histogram with no requests in it", () => {
        expect(percentile(new Array<number>(BAND_COUNT).fill(0), 0.95)).toBe(0);
    });
});

describe("rollEvents", () => {
    it("folds events of the same route, method and minute into one row", () => {
        const rows = rollEvents("project", [event(), event(), event()]);

        expect(rows).toHaveLength(1);
        expect(rows[0]?.requests).toBe(3);
        expect(rows[0]?.minute).toEqual(minute);
    });

    it("keeps a different method apart from the same route", () => {
        const rows = rollEvents("project", [event(), event({ method: "POST" })]);

        expect(rows).toHaveLength(2);
    });

    it("keeps the same route in a different minute apart", () => {
        const rows = rollEvents("project", [
            event(),
            event({ startedAt: new Date("2026-11-02T14:24:01.000Z") }),
        ]);

        expect(rows).toHaveLength(2);
    });

    it("counts 4xx and 5xx separately and leaves 2xx out of both", () => {
        const rows = rollEvents("project", [
            event(),
            event({ statusCode: 404 }),
            event({ statusCode: 499 }),
            event({ statusCode: 500 }),
        ]);

        expect(rows[0]?.requests).toBe(4);
        expect(rows[0]?.clientErrors).toBe(2);
        expect(rows[0]?.serverErrors).toBe(1);
    });

    it("sums and maxes the durations", () => {
        const rows = rollEvents("project", [
            event({ durationUs: 1_000 }),
            event({ durationUs: 9_000 }),
        ]);

        expect(rows[0]?.durationSumUs).toBe(10_000n);
        expect(rows[0]?.durationMaxUs).toBe(9_000);
    });

    it("builds a histogram that holds every request", () => {
        const rows = rollEvents("project", [
            event({ durationUs: 500 }),
            event({ durationUs: 900 }),
            event({ durationUs: 12_500 }),
        ]);

        expect(rows[0]?.latency).toEqual(histogram({ 0: 2, 4: 1 }));
    });

    it("answers with no rows for no events", () => {
        expect(rollEvents("project", [])).toEqual([]);
    });
});

describe("rollupMinute", () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    async function setUpProject(email: string, name: string): Promise<string> {
        const owner = await signUp(email);
        const organizationId = await createOrganization(owner, name);

        return createProject(owner, organizationId, name);
    }

    async function storeEvents(projectId: string, events: Partial<RollupEvent>[]): Promise<void> {
        await prisma.event.createMany({
            data: events.map((overrides) => ({ id: randomUUID(), projectId, ...event(overrides) })),
        });
    }

    it("writes one row per route for the minute", async () => {
        const projectId = await setUpProject("owner@example.com", "Acme");

        await storeEvents(projectId, [{}, {}, { route: "/checkout", statusCode: 500 }]);

        expect(await rollupMinute(minute)).toBe(2);

        const rows = await prisma.routeMinute.findMany({ orderBy: { route: "asc" } });

        expect(rows[0]?.route).toBe("/checkout");
        expect(rows[0]?.serverErrors).toBe(1);
        expect(rows[1]?.route).toBe("/orders/:id");
        expect(rows[1]?.requests).toBe(2);
    });

    it("keeps one project's events out of another's rows", async () => {
        const first = await setUpProject("first@example.com", "First");
        const second = await setUpProject("second@example.com", "Second");

        await storeEvents(first, [{}, {}]);
        await storeEvents(second, [{}]);

        await rollupMinute(minute);

        expect(await prisma.routeMinute.count({ where: { projectId: first } })).toBe(1);
        expect(
            (await prisma.routeMinute.findFirst({ where: { projectId: first } }))?.requests,
        ).toBe(2);
        expect(
            (await prisma.routeMinute.findFirst({ where: { projectId: second } }))?.requests,
        ).toBe(1);
    });

    it("lands on the same rows when it runs twice", async () => {
        const projectId = await setUpProject("owner@example.com", "Acme");

        await storeEvents(projectId, [{}, {}]);

        await rollupMinute(minute);
        const first = await prisma.routeMinute.findMany();

        await rollupMinute(minute);
        const second = await prisma.routeMinute.findMany();

        expect(second).toEqual(first);
    });

    it("picks up an event that arrived after the first run", async () => {
        const projectId = await setUpProject("owner@example.com", "Acme");

        await storeEvents(projectId, [{}]);
        await rollupMinute(minute);

        await storeEvents(projectId, [{}]);
        await rollupMinute(minute);

        expect((await prisma.routeMinute.findFirst())?.requests).toBe(2);
    });

    it("ignores events outside the minute", async () => {
        const projectId = await setUpProject("owner@example.com", "Acme");

        await storeEvents(projectId, [
            { startedAt: new Date("2026-11-02T14:22:59.999Z") },
            { startedAt: new Date("2026-11-02T14:23:00.000Z") },
            { startedAt: new Date("2026-11-02T14:23:59.999Z") },
            { startedAt: new Date("2026-11-02T14:24:00.000Z") },
        ]);

        await rollupMinute(minute);

        expect((await prisma.routeMinute.findFirst())?.requests).toBe(2);
    });

    it("clears the minute when its events are gone", async () => {
        const projectId = await setUpProject("owner@example.com", "Acme");

        await storeEvents(projectId, [{}]);
        await rollupMinute(minute);

        await prisma.event.deleteMany();

        expect(await rollupMinute(minute)).toBe(0);
        expect(await prisma.routeMinute.count()).toBe(0);
    });
});
