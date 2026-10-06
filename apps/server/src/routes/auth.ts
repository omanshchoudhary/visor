import { Router } from "express";

import {
    forgotPassword,
    login,
    logout,
    refresh,
    register,
    resetPassword,
} from "../controllers/auth.ts";

export const authRouter: Router = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
