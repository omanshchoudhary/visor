import { Router } from "express";

import { login, logout, refresh, register } from "../controllers/auth.ts";

export const authRouter: Router = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
