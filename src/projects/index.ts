// src/projects/index.ts
import { Router } from "express";
import createRouter from "./create.js";
import listRouter from "./list.js";
import getRouter from "./get.js";
import deleteRouter from "./delete.js";
import requireWorkspaceMemberRole from ".././middleware/require_workspace_member_role.js";

// mergeParams: true — critical for nested routes
// without this, :workspaceId from the parent mount path (/workspaces/:workspaceId/projects)
// would NOT be accessible via request.params inside any of these routers
const projectRouter = Router({ mergeParams: true });

projectRouter.use(createRouter);
projectRouter.use(listRouter);
projectRouter.use(getRouter);
projectRouter.use(deleteRouter);

export default projectRouter;
