import { hash, verify } from "@node-rs/argon2";
import { SignJWT } from "jose";
import { createHash, randomBytes } from "node:crypto";

import { config } from "../config.ts";
import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import { Prisma } from "../generated/prisma/client.ts";

const ACCESS_TOKEN_TTL = "15m";
const DUMMY_PASSWORD_HASH =
    "$argon2id$v=19$m=19456,t=2,p=1$6Wv7Ka0rde83OmQgYDo2rg$CPb0YJNr9onAwzEpp2DICN9eLPScOhWywzx4Pr9k/oY";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const authSecret = new TextEncoder().encode(config.AUTH_SECRET);

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function newRefreshToken(): string {
    return randomBytes(32).toString("base64url");
}

async function signAccessToken(userId: string, sessionId: string): Promise<string> {
    return new SignJWT({ sid: sessionId })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_TTL)
        .sign(authSecret);
}

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

export async function verifyCredentials(input: LoginInput): Promise<PublicUser> {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, passwordHash: true },
    });

    const passwordMatches = await verify(user?.passwordHash ?? DUMMY_PASSWORD_HASH, input.password);

    if (!user || !passwordMatches) {
        throw new HttpError(401, "Invalid email or password");
    }

    return { id: user.id, email: user.email, name: user.name };
}

export async function startSession(userId: string): Promise<SessionTokens> {
    const refreshToken = newRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const session = await prisma.session.create({
        data: {
            userId,
            expiresAt: refreshTokenExpiresAt,
            refreshTokens: {
                create: { tokenHash: hashToken(refreshToken) },
            },
        },
    });

    return {
        accessToken: await signAccessToken(userId, session.id),
        refreshToken,
        refreshTokenExpiresAt,
    };
}

export function rotateRefreshToken(_refreshToken: string): Promise<SessionTokens> {
    throw new HttpError(501, "Not implemented");
}

export function revokeSession(_refreshToken: string): Promise<void> {
    throw new HttpError(501, "Not implemented");
}
