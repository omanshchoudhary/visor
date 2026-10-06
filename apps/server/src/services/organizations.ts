import { HttpError } from "../errors.ts";
import type { Role } from "../generated/prisma/client.ts";

export type OrganizationSummary = {
    id: string;
    name: string;
    role: Role;
    createdAt: Date;
};

export type OrganizationMember = {
    userId: string;
    email: string;
    name: string;
    role: Role;
    createdAt: Date;
};

export type OrganizationInvite = {
    id: string;
    email: string;
    role: Role;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
};

export type CreateOrganizationInput = {
    name: string;
};

export type UpdateOrganizationInput = {
    name: string;
};

export type CreateInviteInput = {
    email: string;
    role: Role;
};

export function createOrganization(
    _actorUserId: string,
    _input: CreateOrganizationInput,
): Promise<OrganizationSummary> {
    throw new HttpError(501, "Not implemented");
}

export function listOrganizations(_actorUserId: string): Promise<OrganizationSummary[]> {
    throw new HttpError(501, "Not implemented");
}

export function getOrganization(
    _actorUserId: string,
    _organizationId: string,
): Promise<OrganizationSummary> {
    throw new HttpError(501, "Not implemented");
}

export function updateOrganization(
    _actorUserId: string,
    _organizationId: string,
    _input: UpdateOrganizationInput,
): Promise<OrganizationSummary> {
    throw new HttpError(501, "Not implemented");
}

export function deleteOrganization(_actorUserId: string, _organizationId: string): Promise<void> {
    throw new HttpError(501, "Not implemented");
}

export function listMembers(
    _actorUserId: string,
    _organizationId: string,
): Promise<OrganizationMember[]> {
    throw new HttpError(501, "Not implemented");
}

export function updateMemberRole(
    _actorUserId: string,
    _organizationId: string,
    _memberUserId: string,
    _role: Role,
): Promise<OrganizationMember> {
    throw new HttpError(501, "Not implemented");
}

export function removeMember(
    _actorUserId: string,
    _organizationId: string,
    _memberUserId: string,
): Promise<void> {
    throw new HttpError(501, "Not implemented");
}

export function createInvite(
    _actorUserId: string,
    _organizationId: string,
    _input: CreateInviteInput,
): Promise<OrganizationInvite> {
    throw new HttpError(501, "Not implemented");
}

export function listInvites(
    _actorUserId: string,
    _organizationId: string,
): Promise<OrganizationInvite[]> {
    throw new HttpError(501, "Not implemented");
}

export function revokeInvite(
    _actorUserId: string,
    _organizationId: string,
    _inviteId: string,
): Promise<void> {
    throw new HttpError(501, "Not implemented");
}

export function acceptInvite(_actorUserId: string, _token: string): Promise<OrganizationSummary> {
    throw new HttpError(501, "Not implemented");
}
