import { Router } from "express";
import createRouter from "./create.js";
import requireAuth from ".././middleware/require_auth.js";
import requireWorkspaceMemberRole from ".././middleware/require_workspace_member_role.js";
import getRouter from "./get.js";

const workspaceRouter= Router();
workspaceRouter.use("/workspace", requireAuth, createRouter);
workspaceRouter.use("/workspace", requireAuth, requireWorkspaceMemberRole, getRouter);

export default workspaceRouter;
