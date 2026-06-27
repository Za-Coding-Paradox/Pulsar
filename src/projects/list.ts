import { Prisma } from "../../generated/prisma/index.js";
import { Router } from "express";
import type { Request } from "express";
import StatusCodes from "../globals/status_codes.js";
import prisma from "../lib/prisma.js";

const ROUTER = Router({ mergeParams: true });

interface ProjectListParams {
	workspaceId: string;
}

// GET /workspaces/:workspaceId/projects
// requireWorkspaceMemberRole already confirmed membership — no need to re-check here
ROUTER.get("/", async (request: Request<ProjectListParams>, result) => {
	try {
		const { workspaceId } = request.params; // from URL, merged via mergeParams: true

		const workspaceProjects = await prisma.project.findMany({
			where: { workspaceId },
			orderBy: { createdAt: "desc" },
		});

		// findMany returns empty array if no projects exist — still a successful request
		return result
		.status(StatusCodes.LIST_PROJECT_REQUEST_SUCCESSFUL)
		.json({
			message: "Projects Retrieved Successfully.",
			projects: workspaceProjects.map(project => ({
				id: project.id,
				name: project.name,
				description: project.description,
				workspaceId: project.workspaceId,
				createdAt: project.createdAt,
				updatedAt: project.updatedAt,
			})),
		});

	} catch (error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result
			.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED)
			.json({ error: "Service temporarily unavailable." });
		}

		console.error("Unexpected error listing projects:", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({ error: "Projects Listing Failed Due to Unexpected Reasons." });
	}
});

export default ROUTER;
