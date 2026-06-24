import { Router } from "express";
import createRouter from "./create.js";
import requireWorkspaceMemberRole from ".././middleware/require_workspace_member_role.js";
import getRouter from "./get.js";

const workspaceRouter= Router();
workspaceRouter.use(createRouter);
workspaceRouter.use(requireWorkspaceMemberRole, getRouter);
workspaceRouter.use(listRouter);

export default workspaceRouter;
