import express from "express";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js" 

const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

const getWorkspaceSchema = z.object({
	name: z.string().min(4).max(100),
});

ROUTER.post("/get", async (request, result) => {
	try{
		const getWorkspaceRequest = getWorkspaceSchema.safeParse(request.body);
		if (!getWorkspaceRequest.success) {
			return result
			.status(StatusCodes.INVALID_WORKSPACE_GET_REQUEST)
			.json({
				error: "Get Workspace Request is in Invalid Format.",
			});
		}

		const { name } = getWorkspaceRequest.data;
		const workspace = await PRISMA_CLIENT.workspace.findUnique({
			where: {
				name: name,
			},
		});

		if (!workspace) {
			return result
			.status(StatusCodes.WORKSPACE_NOT_FOUND)
			.json({
				error: "Workspace Doesn't Exist.",
			});
		}

		return result
		.status(StatusCodes.GET_WORKSPACE_REQUEST_SUCCESSFUL)
		.json({
			message: "Workspace Data Found.",
			workspace: {
				name: workspace.name,
				id: workspace.id,
				createdAt: workspace.createdAt,
			},
		});
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
		}	

		console.error("Unexpected Error Occured Whilst Getting Workspace", error);
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({
			error: "Workspace Fetching Failed Due to Unexpected Reasons"
		});
	}
})

export default ROUTER;
