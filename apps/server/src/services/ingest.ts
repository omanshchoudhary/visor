import type { RequestEvent } from "@visorhq/contract";

import { prisma } from "../db.ts";
import { authenticateApiKey } from "./access.ts";

export type IngestResult = {
    received: number; // events in the batch
    stored: number; // rows actually written, lower when a batch is replayed
};

// how far a host clock may drift before we stop believing it
const MAX_CLOCK_SKEW_MS = 60 * 60 * 1000;

function trustedStartedAt(startedAt: number, receivedAt: number): Date {
    const drift = Math.abs(receivedAt - startedAt);

    return new Date(drift > MAX_CLOCK_SKEW_MS ? receivedAt : startedAt);
}

export async function storeBatch(key: string, events: RequestEvent[]): Promise<IngestResult> {
    const { apiKeyId, projectId } = await authenticateApiKey(key, "INGEST");
    const receivedAt = Date.now();

    const result = await prisma.event.createMany({
        data: events.map((event) => ({
            id: event.id,
            projectId,
            route: event.route,
            method: event.method,
            statusCode: event.statusCode,
            durationUs: event.durationUs,
            startedAt: trustedStartedAt(event.startedAt, receivedAt),
        })),
        skipDuplicates: true,
    });

    await prisma.apiKey.update({
        where: { id: apiKeyId },
        data: { lastUsedAt: new Date(receivedAt) },
    });

    return {
        received: events.length,
        stored: result.count,
    };
}
