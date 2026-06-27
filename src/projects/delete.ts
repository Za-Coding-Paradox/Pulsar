import { Prisma } from "../../generated/prisma/index.js";
import { Router } from "express";
import type { Request } from "express";
import StatusCodes from "../globals/status_codes.js";
import prisma from "../lib/prisma.js";

const ROUTER = Router({ mergeParams: true });

interface ProjectDeleteParams {
	workspaceId: string;
	id: string;
}

// DELETE /workspaces/:workspaceId/projects/:id
// role check (OWNER or ADMIN) is handled upstream by requireWorkspaceRole middleware
// by the time this handler runs, we know the user is authorized to delete
ROUTER.delete("/:id", async (request: Request<ProjectDeleteParams>, result) => {
	try {
		const { workspaceId, id } = request.params;

		// confirm project exists and belongs to this workspace
		// prevents deleting a project from a different workspace by guessing IDs
		const project = await prisma.project.findUnique({
			where: { id },
		});

		if (!project) {
			return result
			.status(StatusCodes.INVALID_PROJECT_DELETE_REQUEST)
			.json({ error: "Project Not Found." });
		}

		if (project.workspaceId !== workspaceId) {
			return result
			.status(StatusCodes.FORBIDDEN)
			.json({ error: "Project Does Not Belong to This Workspace." });
		}

		await prisma.project.delete({
			where: { id },
		});

		return result
		.status(StatusCodes.DELETE_PROJECT_REQUEST_SUCCESSFUL)
		.json({ message: "Project Deleted Successfully." });

	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				// record to delete was not found
				return result
				.status(StatusCodes.DELETE_PROJECT_REQUEST_SUCCESSFUL)
				.json({ error: "Project Not Found." });
			}
			if (error.code === "P2003") {
				// foreign key constraint — project still has tasks blocking deletion
				return result
				.status(StatusCodes.DELETE_PROJECT_REQUEST_SUCCESSFUL)
				.json({ error: "Cannot delete project — remove all tasks first." });
			}
		}

		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result
			.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED)
			.json({ error: "Service Temporarily Unavailable." });
		}

		console.error("Unexpected error deleting project:", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({ error: "Project Deletion Failed for Unexpected Reasons." });
	}
});

export default ROUTER;
