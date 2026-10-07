import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import type { Role } from "../generated/prisma/client.ts";

const roleRank: Record<Role, number> = {
    VIEWER: 0,
    MEMBER: 1,
    ADMIN: 2,
};

export async function requireMembership(
    userId: string,
    organizationId: string,
    minimum: Role,
): Promise<Role> {
    const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId, organizationId } },
        select: { role: true },
    });

    if (membership === null) {
        throw new HttpError(404, "Organization not found");
    }

    if (roleRank[membership.role] < roleRank[minimum]) {
        throw new HttpError(403, "Forbidden");
    }

    return membership.role;
}
