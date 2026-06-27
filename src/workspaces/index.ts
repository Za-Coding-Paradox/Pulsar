import { Router } from "express";
import createRouter from "./create.js";
import getRouter from "./get.js";
import listRouter from "./list.js";
import deleteRouter from "./delete.js";

const workspaceRouter= Router();
workspaceRouter.use(createRouter);
workspaceRouter.use(getRouter);
workspaceRouter.use(listRouter);
workspaceRouter.use(deleteRouter);

export default workspaceRouter;
