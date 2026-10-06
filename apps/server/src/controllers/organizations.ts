import type { RequestHandler } from "express";

import { HttpError } from "../errors.ts";

export const createOrganization: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const listOrganizations: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const getOrganization: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const updateOrganization: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const deleteOrganization: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const listMembers: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const updateMemberRole: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const removeMember: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const createInvite: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const listInvites: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const revokeInvite: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const acceptInvite: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
