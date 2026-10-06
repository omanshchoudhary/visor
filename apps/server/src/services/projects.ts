import { HttpError } from "../errors.ts";

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

export function createProject(
    _actorUserId: string,
    _organizationId: string,
    _input: CreateProjectInput,
): Promise<ProjectSummary> {
    throw new HttpError(501, "Not implemented");
}

export function listProjects(
    _actorUserId: string,
    _organizationId: string,
): Promise<ProjectSummary[]> {
    throw new HttpError(501, "Not implemented");
}

export function getProject(
    _actorUserId: string,
    _organizationId: string,
    _projectId: string,
): Promise<ProjectSummary> {
    throw new HttpError(501, "Not implemented");
}

export function updateProject(
    _actorUserId: string,
    _organizationId: string,
    _projectId: string,
    _input: UpdateProjectInput,
): Promise<ProjectSummary> {
    throw new HttpError(501, "Not implemented");
}

export function deleteProject(
    _actorUserId: string,
    _organizationId: string,
    _projectId: string,
): Promise<void> {
    throw new HttpError(501, "Not implemented");
}
