import autocannon from "autocannon";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";

type Credentials = {
    projectId: string;
    key: string;
};

const { values } = parseArgs({
    options: {
        url: { type: "string", default: "http://localhost:3000" },
        duration: { type: "string", default: "300" },
        connections: { type: "string", default: "10" },
        batch: { type: "string", default: "50" },
        rate: { type: "string", default: "1000" },
    },
});

const url = values.url;
const duration = Number(values.duration);
const connections = Number(values.connections);
const batchSize = Number(values.batch);
const eventsPerSecond = Number(values.rate);

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
    const response = await fetch(`${url}${path}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`${path} answered ${response.status}: ${await response.text()}`);
    }

    return (await response.json()) as T;
}

async function provision(): Promise<Credentials> {
    const email = `load-${Date.now()}@example.com`;
    const password = "load-test-password";

    await post("/api/auth/register", { email, name: "Load test", password });
    const session = await post<{ accessToken: string }>("/api/auth/login", { email, password });
    const token = session.accessToken;

    const organization = await post<{ id: string }>("/api/orgs", { name: "Load test" }, token);
    const project = await post<{ id: string }>(
        `/api/orgs/${organization.id}/projects`,
        { name: "load-test" },
        token,
    );
    const apiKey = await post<{ key: string }>(
        `/api/orgs/${organization.id}/projects/${project.id}/keys`,
        { name: "load test", type: "INGEST" },
        token,
    );

    return { projectId: project.id, key: apiKey.key };
}

function batch(): string {
    const startedAt = Date.now();
    const events = Array.from({ length: batchSize }, () => ({
        id: randomUUID(),
        route: "/orders/:id",
        method: "GET",
        statusCode: 200,
        durationUs: 12_500,
        startedAt,
    }));

    return JSON.stringify({ events });
}

const credentials = await provision();

let received = 0;
let stored = 0;

console.log(
    `sending ${String(eventsPerSecond)} events/s in batches of ${String(batchSize)} for ${String(duration)}s`,
);

const result = await autocannon({
    url: `${url}/api/ingest`,
    connections,
    duration,
    overallRate: Math.ceil(eventsPerSecond / batchSize),
    headers: {
        "content-type": "application/json",
        authorization: `Bearer ${credentials.key}`,
    },
    requests: [
        {
            method: "POST",
            path: "/api/ingest",
            setupRequest: (request) => ({ ...request, body: batch() }),
            onResponse: (status, body) => {
                if (status !== 202) {
                    return;
                }
                const result = JSON.parse(body) as { received: number; stored: number };
                received += result.received;
                stored += result.stored;
            },
        },
    ],
});

const seconds = result.duration;

console.log(`
project          ${credentials.projectId}
duration         ${String(seconds)}s
batches          ${String(result.requests.sent)} sent, ${String(result["2xx"])} accepted
events           ${String(received)} received, ${String(stored)} written
throughput       ${(stored / seconds).toFixed(0)} events/s
batch latency    p50 ${String(result.latency.p50)}ms  p90 ${String(result.latency.p90)}ms  p97.5 ${String(result.latency.p97_5)}ms  p99 ${String(result.latency.p99)}ms  max ${String(result.latency.max)}ms
errors           ${String(result.errors)} connection, ${String(result.timeouts)} timeout, ${String(result.non2xx)} non-2xx
`);

if (result.non2xx > 0) {
    console.log("non-2xx responses, status counts:", result.statusCodeStats);
    console.log("a 429 here means the server's own rate limit is below the load you asked for");
}

if (received !== stored) {
    console.log(`${String(received - stored)} events were received but not written`);
}
