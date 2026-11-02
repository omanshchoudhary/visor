import { api } from "./client.ts";

export type Project = {
    id: string;
    name: string;
    organizationId: string;
    createdAt: string;
};

export function listProjects(organizationId: string): Promise<Project[]> {
    return api.get<Project[]>(`/orgs/${organizationId}/projects`);
}

export function createProject(organizationId: string, name: string): Promise<Project> {
    return api.post<Project>(`/orgs/${organizationId}/projects`, { name });
}

export function getProject(organizationId: string, projectId: string): Promise<Project> {
    return api.get<Project>(`/orgs/${organizationId}/projects/${projectId}`);
}
