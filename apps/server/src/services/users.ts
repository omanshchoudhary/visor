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

export function getUserProfile(_userId: string): Promise<UserProfile> {
    throw new HttpError(501, "Not implemented");
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
