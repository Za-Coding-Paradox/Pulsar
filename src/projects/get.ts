import { Prisma } from "../../generated/prisma/index.js";
import { Router} from "express";
import type { Request } from "express";
import { z } from "zod";
import StatusCodes from "../globals/status_codes.js";
import prisma from "../lib/prisma.js";

// both workspaceId (from parent mount) and id (from this route) are in params
interface ProjectParams {
  workspaceId: string;
  id: string;
}

const ROUTER = Router();

ROUTER.get("/:id", async (request: Request<ProjectParams>, result) => {
	try {
	const { workspaceId, id } = request.params;

		const project = await prisma.project.findUnique({
			where: { id },
		});

		// project doesn't exist
		if (!project) {
			return result
			.status(StatusCodes.INVALID_PROJECT_GET_REQUEST)
			.json({ error: "Project Not Found." });
		}

		// project exists but belongs to a different workspace
		// prevents a member of workspace A from reading workspace B's projects by guessing IDs
		if (project.workspaceId !== workspaceId) {
			return result
			.status(StatusCodes.INVALID_PROJECT_GET_REQUEST)
			.json({ error: "Project Does Not Belong to This Workspace." });
		}

		return result
		.status(StatusCodes.GET_PROJECT_REQUEST_SUCCESSFUL)
		.json({
			message: "Project Fetched.",
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				workspaceId: project.workspaceId,
				createdAt: project.createdAt,
				updatedAt: project.updatedAt,
			},
		});
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
		}	

		console.error("Unexpected Error Occured Whilst Getting Project.", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({
			error: "Project Fetching Failed Due to Unexpected Reasons"
		});

	}
})

export default ROUTER;
