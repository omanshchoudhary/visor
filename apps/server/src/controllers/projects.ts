import type { RequestHandler } from "express";
import { z } from "zod";

import { authenticatedUserId } from "../middleware/require-auth.ts";
import * as projects from "../services/projects.ts";

type OrganizationParams = {
    organizationId: string;
};

type ProjectParams = {
    organizationId: string;
    projectId: string;
};

const projectSchema = z.object({
    name: z.string().min(1),
});

export const createProject: RequestHandler<OrganizationParams> = async (req, res) => {
    const body = projectSchema.parse(req.body);
    const project = await projects.createProject(
        authenticatedUserId(req),
        req.params.organizationId,
        body,
    );
    res.status(201).json(project);
};

export const listProjects: RequestHandler<OrganizationParams> = async (req, res) => {
    const list = await projects.listProjects(authenticatedUserId(req), req.params.organizationId);
    res.status(200).json(list);
};

export const getProject: RequestHandler<ProjectParams> = async (req, res) => {
    const project = await projects.getProject(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.projectId,
    );
    res.status(200).json(project);
};

export const updateProject: RequestHandler<ProjectParams> = async (req, res) => {
    const body = projectSchema.parse(req.body);
    const project = await projects.updateProject(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.projectId,
        body,
    );
    res.status(200).json(project);
};

export const deleteProject: RequestHandler<ProjectParams> = async (req, res) => {
    await projects.deleteProject(
        authenticatedUserId(req),
        req.params.organizationId,
        req.params.projectId,
    );
    res.status(204).send();
};
