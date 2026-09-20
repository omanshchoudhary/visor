import { hash } from "@node-rs/argon2";

import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import { Prisma } from "../generated/prisma/client.ts";

export type PublicUser = {
    id: string;
    email: string;
    name: string;
};

export type SessionTokens = {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
};

export type RegisterInput = {
    email: string;
    name: string;
    password: string;
};

export type LoginInput = {
    email: string;
    password: string;
};

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await hash(input.password);

    try {
        return await prisma.user.create({
            data: {
                email,
                name: input.name,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new HttpError(409, "Email already taken");
        }
        throw error;
    }
}

export function verifyCredentials(_input: LoginInput): Promise<PublicUser> {
    throw new HttpError(501, "Not implemented");
}

export function startSession(_userId: string): Promise<SessionTokens> {
    throw new HttpError(501, "Not implemented");
}

export function rotateRefreshToken(_refreshToken: string): Promise<SessionTokens> {
    throw new HttpError(501, "Not implemented");
}

export function revokeSession(_refreshToken: string): Promise<void> {
    throw new HttpError(501, "Not implemented");
}
