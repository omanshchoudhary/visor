import { Router } from "express";

import { createApiKey, listApiKeys, revokeApiKey } from "../controllers/api-keys.ts";

export const apiKeysRouter: Router = Router({ mergeParams: true });

apiKeysRouter.post("/", createApiKey);
apiKeysRouter.get("/", listApiKeys);
apiKeysRouter.delete("/:apiKeyId", revokeApiKey);
