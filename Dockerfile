FROM node:26-slim AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM runtime AS build
RUN npm install -g pnpm@12.4.1
ENV HUSKY=0
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store
RUN pnpm exec tsc -b apps/server
RUN pnpm --filter @visorhq/web build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @visorhq/server deploy --prod --store-dir /pnpm/store /app/out/server

FROM runtime AS server
ENV NODE_ENV=production
COPY --from=build /app/out/server .
USER node
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/index.js"]

FROM caddy:2-alpine AS web
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv
