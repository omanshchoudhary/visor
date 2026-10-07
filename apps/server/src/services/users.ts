import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";

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

export function updateUserProfile(_userId: string, _input: UpdateUserInput): Promise<UserProfile> {
    throw new HttpError(501, "Not implemented");
}

export function changePassword(_userId: string, _input: ChangePasswordInput): Promise<void> {
    throw new HttpError(501, "Not implemented");
}

export function deleteUser(_userId: string): Promise<void> {
    throw new HttpError(501, "Not implemented");
}
