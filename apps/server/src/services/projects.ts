import { prisma } from "../db.ts";
import { HttpError } from "../errors.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { requireMembership } from "./access.ts";

export type ProjectSummary = {
    id: string;
    name: string;
    organizationId: string;
    createdAt: Date;
};

export type CreateProjectInput = {
    name: string;
};

export type UpdateProjectInput = {
    name: string;
};

const projectFields = {
    id: true,
    name: true,
    organizationId: true,
    createdAt: true,
} as const;

// scoped on both ids so a project id from another org reads as missing
export async function requireProject(
    organizationId: string,
    projectId: string,
): Promise<ProjectSummary> {
    const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId },
        select: projectFields,
    });

    if (project === null) {
        throw new HttpError(404, "Project not found");
    }

    return project;
}

function asTakenName(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "Project name already taken");
    }
    throw error;
}

export async function createProject(
    actorUserId: string,
    organizationId: string,
    input: CreateProjectInput,
): Promise<ProjectSummary> {
    await requireMembership(actorUserId, organizationId, "MEMBER");

    try {
        return await prisma.project.create({
            data: { name: input.name, organizationId },
            select: projectFields,
        });
    } catch (error) {
        asTakenName(error);
    }
}

export async function listProjects(
    actorUserId: string,
    organizationId: string,
): Promise<ProjectSummary[]> {
    await requireMembership(actorUserId, organizationId, "VIEWER");

    return prisma.project.findMany({
        where: { organizationId },
        select: projectFields,
        orderBy: { createdAt: "asc" },
    });
}

export async function getProject(
    actorUserId: string,
    organizationId: string,
    projectId: string,
): Promise<ProjectSummary> {
    await requireMembership(actorUserId, organizationId, "VIEWER");

    return requireProject(organizationId, projectId);
}

export async function updateProject(
    actorUserId: string,
    organizationId: string,
    projectId: string,
    input: UpdateProjectInput,
): Promise<ProjectSummary> {
    await requireMembership(actorUserId, organizationId, "MEMBER");
    await requireProject(organizationId, projectId);

    try {
        return await prisma.project.update({
            where: { id: projectId },
            data: { name: input.name },
            select: projectFields,
        });
    } catch (error) {
        asTakenName(error);
    }
}

export async function deleteProject(
    actorUserId: string,
    organizationId: string,
    projectId: string,
): Promise<void> {
    await requireMembership(actorUserId, organizationId, "ADMIN");
    await requireProject(organizationId, projectId);

    await prisma.project.delete({ where: { id: projectId } });
}
