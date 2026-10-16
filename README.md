# Visor

Open-source, self-hostable API monitoring for Node and Express, with an MCP server so your coding agent can find, fix and verify production errors.

> **Early development.** Nothing is published to npm yet and there is no hosted instance.

## Architecture

```
your express app ──▶ visor sdk ──▶ batch ──▶ ingest api ──▶ postgres
                                   (ingest key)                 │
                                                                ▼
                                                        rollups and issues
                                                                │
                              dashboard ◀── query api ──────────┤
                              (session)           ▲             │
                                                  └── mcp ──────┘
                                                   (read key)
```

The SDK runs inside your app and records how each request finished. Batches reach the ingest API with a write-only key. Postgres is the whole storage layer. The same data is read back by a dashboard over a login session, and by an MCP server over a read-only key.

## Running it locally

Requires Node 26 (see `.nvmrc`), pnpm 12 and Docker.

```bash
pnpm install
cp apps/server/.env.example apps/server/.env   # then fill in the values
docker compose up                              # whole stack, built images
```

For day-to-day development, run the databases in Docker and the apps on your machine:

```bash
docker compose up -d postgres mailpit
pnpm --filter @visorhq/server db:migrate
pnpm dev
```

The server listens on `http://localhost:3000`, the full stack serves on `http://localhost:8080`, and Mailpit's inbox is on `http://localhost:8025`.

## Ingest performance

1,000 events/s for 5 minutes, server and Postgres on the same machine:

| | |
| --- | --- |
| Events written | 300,000 of 300,000 sent |
| Throughput | 999 events/s |
| Batch latency | p50 42 ms, p90 90 ms, p99 125 ms |
| Errors | 0 |

Batches of 50 over 10 connections, measured with autocannon. Reproduce it against a running server:

```bash
pnpm --filter @visorhq/server loadtest --duration 300 --rate 1000 --batch 50
```

Ingest is rate limited per key, 500 events/s by default, so raise `INGEST_EVENTS_PER_SECOND` on the server before asking for more than that.

## Repository layout

| Path | What it is |
| --- | --- |
| `apps/server` | Express API, Prisma schema and migrations |
| `apps/web` | The dashboard |
| `apps/site` | The landing page |
| `packages/sdk` | `@visorhq/node`, the SDK that runs inside your app |
| `packages/contract` | The versioned event shape shared by SDK and server |
| `packages/mcp` | The MCP server |
| `packages/ui` | Shared design system |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues go through [SECURITY.md](SECURITY.md), not public issues.

## Licence

[MIT](LICENSE)
