import { api } from "./client.ts";

export type Role = "ADMIN" | "MEMBER" | "VIEWER";

export type Organization = {
    id: string;
    name: string;
    role: Role;
    createdAt: string;
};

export function listOrganizations(): Promise<Organization[]> {
    return api.get<Organization[]>("/orgs");
}

export function createOrganization(name: string): Promise<Organization> {
    return api.post<Organization>("/orgs", { name });
}

export function getOrganization(organizationId: string): Promise<Organization> {
    return api.get<Organization>(`/orgs/${organizationId}`);
}
