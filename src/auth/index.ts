// src/auth/index.ts
import { Router } from "express";
import signupRouter from "./signup.js";
import loginRouter from "./login.js";

const authRouter = Router();

authRouter.use(signupRouter);
authRouter.use(loginRouter);

export default authRouter;
