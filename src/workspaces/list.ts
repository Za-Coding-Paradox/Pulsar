import express from "express";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js" 

const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

ROUTER.get("/", async (request, result) => {
	try {
		const userId = request.user?.userId;
		if (!userId) {
			return result
			.status(StatusCodes.INVALID_WORKSPACE_LIST_REQUEST)
			.json({
				message: "User context not found. Are you authenticated?",
			});
		}

		// Fetch user memberships AND include the actual workspace data
		const userWorkspaces = await PRISMA_CLIENT.workspaceMember.findMany({
			where: {
				userId: userId,
			},
			include: {
				workspace: true // This tells Prisma to join the workspace table
			}
		});

		// findMany returns an empty array if no records exist
		if (userWorkspaces.length === 0) {
			return result
			// Usually, an empty list is still a "successful" request (200 OK)
			.status(StatusCodes.LIST_WORKSPACE_REQUEST_SUCCESSFUL) 
			.json({
				message: "User is not a Member of Any Workspace.",
				workspaces: [],
			});
		}

		// Map over the results to send a clean payload to the client
		const formattedWorkspaces = userWorkspaces.map(member => ({
			id: member.workspace.id,
		}));

		return result
		.status(StatusCodes.LIST_WORKSPACE_REQUEST_SUCCESSFUL)
		.json({
			message: "Workspaces Retrieved Successfully.",
			workspaces: formattedWorkspaces
		});
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
		}    

		console.error("Unexpected Error Occured Whilst Listing Workspaces", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({
			error: "Workspace Fetching Failed Due to Unexpected Reasons"
		});
	}
});

export default ROUTER;
