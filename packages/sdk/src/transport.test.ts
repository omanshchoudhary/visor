import { describe, expect, it, vi } from "vitest";

import type { RequestEvent } from "@visorhq/contract";

import { createTransport, type TransportOptions } from "./transport.ts";

const events: RequestEvent[] = [
    { route: "/users/:id", method: "GET", statusCode: 200, durationMs: 12.5, startedAt: 1 },
];

function response(status: number, headers: Record<string, string> = {}): Response {
    return new Response(status === 204 ? null : "{}", { status, headers });
}

function setUp(responses: (Response | Error)[], overrides: Partial<TransportOptions> = {}) {
    const calls: { url: string; init: RequestInit }[] = [];
    let index = 0;

    const fetchImpl = vi.fn((url: string | URL | Request, init?: RequestInit) => {
        calls.push({ url: url instanceof Request ? url.url : url.toString(), init: init ?? {} });
        const next = responses[Math.min(index, responses.length - 1)];
        index += 1;

        return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
    }) as unknown as typeof fetch;

    const send = createTransport({
        url: "https://visor.example",
        key: "visor_ingest_abc",
        baseDelayMs: 1,
        fetchImpl,
        ...overrides,
    });

    return { send, calls, fetchImpl };
}

describe("createTransport", () => {
    it("posts the batch with the ingest key", async () => {
        const { send, calls } = setUp([response(202)]);

        await send(events);

        expect(calls).toHaveLength(1);
        expect(calls[0]?.url).toBe("https://visor.example/api/ingest");
        expect(calls[0]?.init.method).toBe("POST");
        expect((calls[0]?.init.headers as Record<string, string>).authorization).toBe(
            "Bearer visor_ingest_abc",
        );
        expect(JSON.parse((calls[0]?.init.body as string) ?? "")).toEqual({ events });
    });

    it("aborts a request that hangs", async () => {
        const { send, calls } = setUp([response(202)], { timeoutMs: 50 });

        await send(events);

        expect(calls[0]?.init.signal).toBeInstanceOf(AbortSignal);
    });

    it("retries a 500 and resolves when it works", async () => {
        const { send, calls } = setUp([response(500), response(202)]);

        await send(events);

        expect(calls).toHaveLength(2);
    });

    it("retries a network error", async () => {
        const { send, calls } = setUp([new Error("ECONNREFUSED"), response(202)]);

        await send(events);

        expect(calls).toHaveLength(2);
    });

    it("does not retry a bad key", async () => {
        const { send, calls } = setUp([response(401)]);

        await expect(send(events)).rejects.toThrow("ingest failed: 401");
        expect(calls).toHaveLength(1);
    });

    it("does not retry a rejected payload", async () => {
        const { send, calls } = setUp([response(400)]);

        await expect(send(events)).rejects.toThrow("ingest failed: 400");
        expect(calls).toHaveLength(1);
    });

    it("gives up after the retry budget", async () => {
        const { send, calls } = setUp([response(503)], { maxRetries: 2 });

        await expect(send(events)).rejects.toThrow("ingest failed: 503");
        expect(calls).toHaveLength(3);
    });

    it("retries a 429", async () => {
        const { send, calls } = setUp([response(429), response(202)]);

        await send(events);

        expect(calls).toHaveLength(2);
    });

    it("reports a failure once per outage", async () => {
        const onError = vi.fn();
        const { send } = setUp([response(500)], { maxRetries: 0, onError });

        await expect(send(events)).rejects.toThrow();
        await expect(send(events)).rejects.toThrow();
        await expect(send(events)).rejects.toThrow();

        expect(onError).toHaveBeenCalledTimes(1);
    });

    it("reports again after a recovery", async () => {
        const onError = vi.fn();
        const { send } = setUp([response(500), response(202), response(500)], {
            maxRetries: 0,
            onError,
        });

        await expect(send(events)).rejects.toThrow();
        await send(events);
        await expect(send(events)).rejects.toThrow();

        expect(onError).toHaveBeenCalledTimes(2);
    });
});
