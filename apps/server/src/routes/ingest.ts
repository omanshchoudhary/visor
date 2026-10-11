import { Router } from "express";

import { ingestEvents } from "../controllers/ingest.ts";

export const ingestRouter: Router = Router();

ingestRouter.post("/", ingestEvents);
