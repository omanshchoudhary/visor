import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import type { Role } from "../generated/prisma/client.ts";
import { requireMembership } from "./access.ts";

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

export async function createOrganization(
    actorUserId: string,
    input: CreateOrganizationInput,
): Promise<OrganizationSummary> {
    const organization = await prisma.organization.create({
        data: {
            name: input.name,
            memberships: {
                create: { userId: actorUserId, role: "ADMIN" },
            },
        },
        select: { id: true, name: true, createdAt: true },
    });

    return { ...organization, role: "ADMIN" };
}

export async function listOrganizations(actorUserId: string): Promise<OrganizationSummary[]> {
    const memberships = await prisma.membership.findMany({
        where: { userId: actorUserId },
        include: { organization: true },
    });

    return memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
        createdAt: membership.organization.createdAt,
    }));
}

// any member can read one org they belong to
export async function getOrganization(
    actorUserId: string,
    organizationId: string,
): Promise<OrganizationSummary> {
    const role = await requireMembership(actorUserId, organizationId, "VIEWER");
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true, createdAt: true },
    });

    if (organization === null) {
        throw new HttpError(404, "Organization not found");
    }

    return { ...organization, role };
}

// admin renames the org
export async function updateOrganization(
    actorUserId: string,
    organizationId: string,
    input: UpdateOrganizationInput,
): Promise<OrganizationSummary> {
    const role = await requireMembership(actorUserId, organizationId, "ADMIN");
    const organization = await prisma.organization.update({
        where: { id: organizationId },
        data: { name: input.name },
        select: { id: true, name: true, createdAt: true },
    });

    return { ...organization, role };
}

// admin deletes the org; memberships, projects, keys, and invites cascade
export async function deleteOrganization(
    actorUserId: string,
    organizationId: string,
): Promise<void> {
    await requireMembership(actorUserId, organizationId, "ADMIN");
    await prisma.organization.delete({ where: { id: organizationId } });
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
