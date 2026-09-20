import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

import { testDatabaseUrl } from "./database-url.ts";

async function createDatabase(): Promise<void> {
    const url = new URL(testDatabaseUrl);
    const database = url.pathname.slice(1);
    url.pathname = "/postgres";

    const client = new Client({ connectionString: url.toString() });
    await client.connect();
    try {
        const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
            database,
        ]);
        if (existing.rowCount === 0) {
            await client.query(`CREATE DATABASE "${database}"`);
        }
    } finally {
        await client.end();
    }
}

export default async function setup(): Promise<void> {
    await createDatabase();

    const serverDir = fileURLToPath(new URL("../../", import.meta.url));

    execFileSync("node_modules/.bin/prisma", ["migrate", "deploy"], {
        cwd: serverDir,
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
        stdio: "ignore",
    });
}
