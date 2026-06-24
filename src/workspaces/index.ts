import { Router } from "express";
import createRouter from "./create.js";
import requireAuth from ".././middleware/require_auth.js";

const workspaceRouter= Router();
workspaceRouter.use("/workspace", requireAuth, createRouter);

export default workspaceRouter;
