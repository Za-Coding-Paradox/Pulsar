import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Constants } from ".././globals/constants.js";
import StatusCodes from ".././globals/status_codes.js";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";

const PRISMA_CLIENT = new PrismaClient();

// Added the "async" keyword here so you can use "await" inside
async function requireWorkspaceMemberRole(
	request: Request, 
	response: Response, 
	nextFunc: NextFunction
): Promise<void> { // Express handles Promise<void> safely for async middleware
	try {
		const userId = request.user?.userId; 
		if (!userId) {
			response
			.status(StatusCodes.INVALID_WORKSPACE_GET_REQUEST)
			.json({
				error: "UserId not Found.",
			});
			return;
		} // check for TS compiler to allow search in PrismaClient "findFirst"
		// this ensures that userId does exist, and is not undefined

		const workspaceName = request.body.name; 
		if (!workspaceName) {
			response 
			.status(StatusCodes.INVALID_WORKSPACE_GET_REQUEST)
			.json({
				error: "Workspace Name not Found",
			});
			return; 
		} 

		// "findFirst" because you are searching by a nested relationship (workspace name)
		const checkWorkspaceMember = await PRISMA_CLIENT.workspaceMember.findFirst({
			where: {
				userId: userId,
				workspace: {
					name: workspaceName
				},
			},
		});

		// Handle the case where the user is NOT a member of that workspace
		if (!checkWorkspaceMember) {
			response
			.status(StatusCodes.WORKSPACE_MEMBER_OF_VALIDATION_FAILED) // Use your equivalent forbidden status code
			.json({
				error: "You are not a member of this workspace."
			});
			return;
		}

		// Success! Call nextFunc() to move to the loginRouter or next handler
		nextFunc();

	} catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			response.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
			return
		}	

		console.error("Error checking workspace membership:", error);
		response
		.status(StatusCodes.INTERNAL_SERVER_ERROR) // Use your server error status code
		.json({
			error: "Internal server error validating workspace role."
		});
	}
}

export default requireWorkspaceMemberRole;
