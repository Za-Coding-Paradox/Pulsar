import express from "express";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js" 

const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

ROUTER.delete("/:id", async (request, result) => {
	try{
		// GET /workspaces/:id — fetches a single workspace by its id from URL params
		// id comes from the URL, not the body — GET requests don't carry a body
		const userId = request.user!.userId;
		const { id } = request.params; // can only do this because "id" is in GET request url "/id"

		if (!userId || !id) {
			return result
			.status(StatusCodes.INVALID_WORKSPACE_DELETE_REQUEST)
			.json({
				error: "User ID or Workspace ID wasn't Present in Request.",
			});
		}

		const membership = await PRISMA_CLIENT.workspaceMember.findUnique({
			where: {
				userId_workspaceId: { 
					userId,
					workspaceId: id,
				},	
			},
		});

		if (!membership || membership.role !== "OWNER") {
			return result
			.status(StatusCodes.WORKSPACE_MEMBER_OF_VALIDATION_FAILED)
			.json({
				error: "Must be Owner to Delete The Workspace.",
			});
		}
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
		}	

		console.error("Unexpected Error Occured Whilst Deleting Workspace", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({
			error: "Workspace Deletion Failed Due to Unexpected Reasons"
		});
	}
})

export default ROUTER;
