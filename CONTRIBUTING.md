# Contributing

Visor is early and written by one person, so there is nothing to coordinate yet. If you want to run it or send a fix, this is what you need.

## Setup

Node 26 (see `.nvmrc`), pnpm 12 and Docker.

```bash
pnpm install
cp apps/server/.env.example apps/server/.env
docker compose up -d postgres mailpit
pnpm --filter @visorhq/server db:migrate
pnpm dev
```

## Before a pull request

These four run in CI, so run them first. Tests need Postgres up; they use a separate `visor_test` database and leave your development data alone.

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
```

## Commits

Conventional Commits, one line, no body:

```
feat(server): add project crud scoped to the organization
fix(sdk): stop the flush loop awaiting itself
```

Scopes in use: `server`, `sdk`, `web`, `site`, `ui`, `mcp`, `contract`, `ci`.

## Security

Do not open a public issue for security problems. See [SECURITY.md](SECURITY.md).
