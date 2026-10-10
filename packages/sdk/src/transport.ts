import type { SendBatch } from "./queue.ts";

export type TransportOptions = {
    url: string; // base url of the visor server
    key: string; // ingest key
    timeoutMs?: number; // default 5000
    maxRetries?: number; // default 3
    baseDelayMs?: number; // default 500, first backoff step
    onError?: (error: Error) => void; // called once per failure streak, not per attempt
    fetchImpl?: typeof fetch; // injectable so tests need no server
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        timer.unref?.();
    });
}

export function createTransport(options: TransportOptions): SendBatch {
    const timeoutMs = options.timeoutMs ?? 5000;
    const maxRetries = options.maxRetries ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 500;
    const fetchImpl = options.fetchImpl ?? fetch;

    // one log line per outage, not one per batch
    let failing = false;

    return async (events) => {
        for (let attempt = 0; ; attempt += 1) {
            let error: Error | undefined;
            let retryable = true;

            try {
                const response = await fetchImpl(`${options.url}/api/ingest`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: `Bearer ${options.key}`,
                    },
                    body: JSON.stringify({ events }),
                    signal: AbortSignal.timeout(timeoutMs),
                });

                if (response.ok) {
                    failing = false;
                    return;
                }

                error = new Error(`ingest failed: ${response.status}`);
                // a 4xx means the key or the payload is wrong, and still will be next time
                retryable = response.status === 429 || response.status >= 500;
            } catch (cause) {
                error = cause instanceof Error ? cause : new Error(String(cause));
            }

            if (!retryable || attempt >= maxRetries) {
                if (!failing) {
                    failing = true;
                    options.onError?.(error);
                }
                throw error;
            }

            // jitter, so every instance of the host app does not retry on the same millisecond
            await sleep(baseDelayMs * 2 ** attempt * (0.5 + Math.random() * 0.5));
        }
    };
}
