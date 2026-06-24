import express from "express";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js" 

const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

const createWorkspaceSchema = z.object({
	name: z.string().min(4).max(100),
});

ROUTER.post("/", async(request, result) => {
 	try {
		const createRequest = createWorkspaceSchema.safeParse(request.body);
		if(!createRequest.success) {
			return result
			.status(StatusCodes.INVALID_WORKSPACE_CREATE_REQUEST)
			.json({
				error: "The Workspace Create Request was Invalid.",
				details: createRequest.error.flatten(),
			});
		};
		
		const { name } = createRequest.data;
		const userId = request.user!.userId; // guaranteed by requireAuth Function
	
		// `tx` is a transaction-scoped Prisma client — identical API to `prisma`, but every 
		// operation run through it shares the same database connection and transaction.
		// If any step throws, ALL operations in this callback are rolled back automatically.
		// Use `tx` instead of `prisma` inside $transaction to actually get atomicity guarantees —
		// using `prisma` directly here would run queries outside the transaction entirely.
		const workspace = await PRISMA_CLIENT.$transaction( async (tx) => {
			const newWorkspace = await tx.workspace.create({
				data: { name },
			}); // creates the workspace

			await tx.workspaceMember.create({
				data: {
					userId,
					workspaceId: newWorkspace.id,
					role: "OWNER",
				}
			}); // creates the workspaceMember, this is because that in prisma the workspaceMember[] field inside workspace doesn't exist at all.
			// that field is purely for query purposes
			// that is why we don't add workspaceMember into the workspace itself, it will just reference it as a foreign entity.
			
			return newWorkspace;
		});

		return result
		.status(StatusCodes.WORKSPACE_CREATION_SUCCESSFUL)
		.json({
			message: "Workspace Created.",
			workspace: {
				id: workspace.id,
				name: workspace.name,
				createdAt: workspace.createdAt,
			}
		});
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
				case "P2002": // unique constraint violation
					return result.status( StatusCodes.WORKSPACE_CREATION_FAILED).json({ error: "Name Already in Use" });

				case "P2003": // foreign key constraint failed
					return result.status(StatusCodes.WORKSPACE_CREATION_FAILED ).json({ error: "Referenced Record Doesn't Exist" });

				case "P2025": // record to update/delete not found
					return result.status( StatusCodes.WORKSPACE_CREATION_FAILED ).json({ error: "Record not Found" });

				default:
					console.error("Unhandled Prisma error:", error.code, error.message);
				return result.status(StatusCodes.WORKSPACE_CREATION_FAILED).json({ error: "Database Error" });
			}		
		}
		else if (error instanceof Prisma.PrismaClientValidationError) { // this is very rare if zod passes the format
			return result.status(StatusCodes.WORKSPACE_CREATION_FAILED).json({ error: "Invalid Data | Malformed Data" });
		}
		else { // we just don't know what happened here
			console.error("Unexpected Error Occured in Signup", error);
			return result.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Workspace Creation Failed for Unexpected Reasons" });
		}
	
	}
});

export default ROUTER;
