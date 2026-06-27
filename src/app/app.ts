import express from "express";
import authRouter from "../auth/index.js";
import workspaceRouter from "../workspaces/index.js";
import projectRouter from "../projects/index.js";
import requireAuth from ".././middleware/require_auth.js";
import requireWorkspaceMemberRole from ".././middleware/require_workspace_member_role.js";
import { requireWorkspaceRole } from ".././middleware/require_workspace_crud_role.js";

// returns an application object, that works as a server object (routing, and api calls)
const app = express();

// Automatically parse incoming requests into objects. Assumes that requests are in JSON format
app.use(express.json());

// ── Public Routes ─────────────────────────────────────────────────────────────
// no auth required — signup, login, refresh
app.use("/auth", authRouter);

// ── Workspace Routes ──────────────────────────────────────────────────────────
// requireAuth: must be logged in
// no role check here — workspace-level operations handle their own role checks internally
// (e.g. delete workspace checks for OWNER inside the route)
app.use("/workspaces", requireAuth, workspaceRouter);
app.delete(
	"/workspaces/:id",
	requireAuth,
	requireWorkspaceRole("OWNER"),
	workspaceRouter
);

// ── Project Routes ────────────────────────────────────────────────────────────
// GET/POST (list, get, create) — any workspace member
app.use(
  "/workspaces/:workspaceId/projects",
  requireAuth,
  projectRouter
);

// DELETE, PATCH (delete, update) — ADMIN or OWNER only
// these must be defined BEFORE the general mount above so Express matches
// the more specific route + method combination first
app.delete(
  "/workspaces/:workspaceId/projects/:id",
  requireAuth,
  requireWorkspaceRole("ADMIN"),
  projectRouter
);

app.patch(
  "/workspaces/:workspaceId/projects/:id",
  requireAuth,
  requireWorkspaceRole("ADMIN"),
  projectRouter
);

export default app;













































/*
This entire segment was written at the start of the program to understand express.
Now there is no need for this, and it will be removed in main release app (hopefully :) )

// GET Endpoint for the app server
app.get("/", (request, result) => {
	result.json({ 
		message: "The GET request was received",
		status: "true" 
	}); // result is an open connection that you send values into.
	// once you have made an operation on result, you can't touch it back. The connection stops
	// the reason we are not using request here is because, we don't need the request.
	// this is because its a GET endpoint, and request is a incoming input, and we don't need it for this specific endpoint
});

app.post("/", (request, result) => {
	const requestTitle = request.body.name; // fetching the TITLE of the request
	console.log(request.body); // printing the recieved request on console

	result.json({
		message: "Request Recieved",
		title: "request.title"
	}); // sending back acknowledgment signal
});
*/
