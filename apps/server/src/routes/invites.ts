import { Router } from "express";

import { acceptInvite } from "../controllers/organizations.ts";

export const invitesRouter: Router = Router();

invitesRouter.post("/accept", acceptInvite);
