import { Prisma } from "../../generated/prisma/client.js";
import { Router} from "express";
import type { Request } from "express";
import { z } from "zod";
import StatusCodes from "../globals/status_codes.js";
import prisma from "../lib/prisma.js";

const ROUTER = Router();

ROUTER.get("/", async (request, result) => {
	try {
		const workspaceId = request.workspace?.workspaceId;
		if (!workspaceId) {
			return result
			.status(StatusCodes.INVALID_PROJECT_LIST_REQUEST)
			.json({
				message: "User context not found. Are you authenticated?",
			});
		}

		// Fetch user memberships AND include the actual workspace data
		const workspaceProjects = await prisma.project.findMany({
			where: {
				workspaceId,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// findMany returns an empty array if no records exist
		if (workspaceProjects.length === 0) {
			return result
			// Usually, an empty list is still a "successful" request (200 OK)
			.status(StatusCodes.LIST_PROJECT_REQUEST_SUCCESSFUL) 
			.json({
				message: "Project is not a Member of Any Workspace.",
				projects: [],
			});
		}

		// Map over the results to send a clean payload to the client
		const formattedProjects = workspaceProjects.map(project => ({
			id: project.id,
			name: project.name,
		}));

		return result
		.status(StatusCodes.LIST_PROJECT_REQUEST_SUCCESSFUL)
		.json({
			message: "Projects Retrieved Successfully.",
			Projects: formattedProjects, 
		});
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
		}    

		console.error("Unexpected Error Occured Whilst Listing Projects", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({
			error: "Projects Listing Failed Due to Unexpected Reasons"
		});

	}
})

export default ROUTER;
