import { Router } from "express";

import { changeMyPassword, deleteMe, getMe, updateMe } from "../controllers/users.ts";

export const usersRouter: Router = Router();

usersRouter.get("/me", getMe);
usersRouter.patch("/me", updateMe);
usersRouter.post("/me/password", changeMyPassword);
usersRouter.delete("/me", deleteMe);
