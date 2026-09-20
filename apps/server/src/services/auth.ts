import { HttpError } from "../errors.ts";

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

export function registerUser(_input: RegisterInput): Promise<PublicUser> {
    throw new HttpError(501, "Not implemented");
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
