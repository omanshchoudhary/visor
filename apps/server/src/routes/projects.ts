import { Router } from "express";

import {
    createProject,
    deleteProject,
    getProject,
    listProjects,
    updateProject,
} from "../controllers/projects.ts";
import { apiKeysRouter } from "./api-keys.ts";

export const projectsRouter: Router = Router({ mergeParams: true });

projectsRouter.post("/", createProject);
projectsRouter.get("/", listProjects);
projectsRouter.get("/:projectId", getProject);
projectsRouter.patch("/:projectId", updateProject);
projectsRouter.delete("/:projectId", deleteProject);

projectsRouter.use("/:projectId/keys", apiKeysRouter);
