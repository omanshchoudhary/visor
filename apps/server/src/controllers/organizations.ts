import type { RequestHandler } from "express";
import { z } from "zod";

import { HttpError } from "../errors.ts";
import { authenticatedUserId } from "../middleware/require-auth.ts";
import * as organizations from "../services/organizations.ts";

type OrganizationParams = {
    organizationId: string;
};

type MemberParams = OrganizationParams & {
    memberUserId: string;
};

const createOrganizationSchema = z.object({
    name: z.string().min(1),
});

const updateOrganizationSchema = z.object({
    name: z.string().min(1),
});

const updateMemberRoleSchema = z.object({
    role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export const createOrganization: RequestHandler = async (req, res) => {
    const body = createOrganizationSchema.parse(req.body);
    const organization = await organizations.createOrganization(authenticatedUserId(req), body);
    res.status(201).json(organization);
};

export const listOrganizations: RequestHandler = async (req, res) => {
    const list = await organizations.listOrganizations(authenticatedUserId(req));
    res.status(200).json(list);
};

export const getOrganization: RequestHandler<OrganizationParams> = async (req, res) => {
    const organization = await organizations.getOrganization(
        authenticatedUserId(req),
        req.params.organizationId,
    );
    res.status(200).json(organization);
};

export const updateOrganization: RequestHandler<OrganizationParams> = async (req, res) => {
    const body = updateOrganizationSchema.parse(req.body);
    const organization = await organizations.updateOrganization(
        authenticatedUserId(req),
        req.params.organizationId,
        body,
    );
    res.status(200).json(organization);
};

export const deleteOrganization: RequestHandler<OrganizationParams> = async (req, res) => {
    await organizations.deleteOrganization(authenticatedUserId(req), req.params.organizationId);
    res.status(204).send();
};

export const listMembers: RequestHandler<OrganizationParams> = async (req, res) => {
    const members = await organizations.listMembers(
        authenticatedUserId(req),
        req.params.organizationId,
    );
    res.status(200).json(members);
};

export const updateMemberRole: RequestHandler<MemberParams> = async (req, res) => {
    const body = updateMemberRoleSchema.parse(req.body);
    const member = await organizations.updateMemberRole(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.memberUserId,
        body.role,
    );
    res.status(200).json(member);
};

export const removeMember: RequestHandler<MemberParams> = async (req, res) => {
    await organizations.removeMember(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.memberUserId,
    );
    res.status(204).send();
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
