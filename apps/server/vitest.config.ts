import { defineConfig } from "vitest/config";

import { testDatabaseUrl } from "./src/test/database-url.ts";

export default defineConfig({
    test: {
        env: {
            NODE_ENV: "test",
            DATABASE_URL: testDatabaseUrl,
            AUTH_SECRET: "test-secret-that-is-long-enough-to-pass",
            INGEST_EVENTS_PER_SECOND: "100",
            INGEST_BURST: "200",
        },
        include: ["src/**/*.test.ts"],
        globalSetup: "./src/test/global-setup.ts",
        fileParallelism: false,
    },
});
