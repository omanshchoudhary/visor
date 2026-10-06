import { Router } from "express";

import {
    createInvite,
    createOrganization,
    deleteOrganization,
    getOrganization,
    listInvites,
    listMembers,
    listOrganizations,
    removeMember,
    revokeInvite,
    updateMemberRole,
    updateOrganization,
} from "../controllers/organizations.ts";
import { projectsRouter } from "./projects.ts";

export const organizationsRouter: Router = Router();

organizationsRouter.post("/", createOrganization);
organizationsRouter.get("/", listOrganizations);
organizationsRouter.get("/:organizationId", getOrganization);
organizationsRouter.patch("/:organizationId", updateOrganization);
organizationsRouter.delete("/:organizationId", deleteOrganization);

organizationsRouter.get("/:organizationId/members", listMembers);
organizationsRouter.patch("/:organizationId/members/:memberUserId", updateMemberRole);
organizationsRouter.delete("/:organizationId/members/:memberUserId", removeMember);

organizationsRouter.post("/:organizationId/invites", createInvite);
organizationsRouter.get("/:organizationId/invites", listInvites);
organizationsRouter.delete("/:organizationId/invites/:inviteId", revokeInvite);

organizationsRouter.use("/:organizationId/projects", projectsRouter);
