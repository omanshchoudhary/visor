import { hash, verify } from "@node-rs/argon2";

import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import { inSerializableTransaction } from "./transactions.ts";

export type UserProfile = {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
};

export type UpdateUserInput = {
    name: string;
};

export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    if (user === null) {
        throw new HttpError(404, "User not found");
    }

    return user;
}

export async function updateUserProfile(
    userId: string,
    input: UpdateUserInput,
): Promise<UserProfile> {
    return prisma.user.update({
        where: { id: userId },
        data: { name: input.name },
        select: { id: true, email: true, name: true, createdAt: true },
    });
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
    });

    if (user === null) {
        throw new HttpError(404, "User not found");
    }

    if (!(await verify(user.passwordHash, input.currentPassword))) {
        throw new HttpError(401, "Invalid password");
    }

    const passwordHash = await hash(input.newPassword);

    // a new password logs every device out, so both writes land together
    await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
        prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        }),
    ]);
}

export async function deleteUser(userId: string): Promise<void> {
    await inSerializableTransaction(async (tx) => {
        const adminOf = await tx.membership.findMany({
            where: { userId, role: "ADMIN" },
            select: { organizationId: true },
        });

        for (const { organizationId } of adminOf) {
            const others = await tx.membership.count({
                where: { organizationId, userId: { not: userId } },
            });

            if (others > 0) {
                throw new HttpError(
                    409,
                    "Hand over or delete the organizations you administer first",
                );
            }

            await tx.organization.delete({ where: { id: organizationId } });
        }

        await tx.user.delete({ where: { id: userId } });
    });
}
