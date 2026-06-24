// src/auth/index.ts
import { Router } from "express";
import signupRouter from "./signup.js";
import loginRouter from "./login.js";
import refreshRouter from "./refresh.js";

const authRouter = Router();

authRouter.use(signupRouter);
authRouter.use(loginRouter);
authRouter.use(refreshRouter);

export default authRouter;
