import type { Prisma as PrismaTypes } from "../generated/prisma/client.ts";
import { prisma } from "../db.ts";
import { Prisma } from "../generated/prisma/client.ts";

const MAX_ATTEMPTS = 3;

// serializable, because a guard that counts rows before writing is otherwise
// safe only against itself; postgres aborts the loser and we run it again
export async function inSerializableTransaction<T>(
    run: (tx: PrismaTypes.TransactionClient) => Promise<T>,
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            return await prisma.$transaction(run, { isolationLevel: "Serializable" });
        } catch (error) {
            const isWriteConflict =
                error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";

            if (!isWriteConflict) {
                throw error;
            }
            lastError = error;
        }
    }

    throw lastError;
}
