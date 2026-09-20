import { PrismaPg } from "@prisma/adapter-pg";

import { config } from "./config.ts";
import { PrismaClient } from "./generated/prisma/client.ts";

// DB needs to respond within 5 sec timout limit otherwise it fails rather than hanging out
export const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: config.DATABASE_URL,
        connectionTimeoutMillis: 5_000,
    }),
});
