import type { RequestHandler } from "express";

import { HttpError } from "../errors.ts";

export const createProject: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const listProjects: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const getProject: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const updateProject: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};

export const deleteProject: RequestHandler = (_req, _res) => {
    throw new HttpError(501, "Not implemented");
};
