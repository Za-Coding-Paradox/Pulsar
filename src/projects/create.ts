import { Prisma } from "../../generated/prisma/client.js";
import { Router} from "express";
import type { Request } from "express";
import { z } from "zod";
import StatusCodes from "../globals/status_codes.js";
import prisma from "../lib/prisma.js";

const ROUTER = Router({ mergeParams: true });

const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
});

// defines the shape of URL params this route expects
// workspaceId comes from the parent mount path /workspaces/:workspaceId/projects
interface ProjectParams {
	workspaceId: string;
}

// POST /workspaces/:workspaceId/projects
// workspaceId is injected from the parent mount path in app.ts
ROUTER.post("/", async (request: Request<ProjectParams>, result) => {
	try {
		const parsed = createProjectSchema.safeParse(request.body);
		if (!parsed.success) {
			return result
			.status(StatusCodes.INVALID_PROJECT_CREATE_REQUEST)
			.json({
				error: "Invalid Project Data.",
				details: parsed.error.flatten(),
			});
		}

		const { name, description } = parsed.data;
		const { workspaceId } = request.params; // injected from /workspaces/:workspaceId/projects

		const project = await prisma.project.create({
			data: {
				name,
				description: description ?? null,
				workspaceId,
			},
		});

		// NOTE: exactOptionalPropertyTypes in tsconfig makes TypeScript strict about the difference
		// between `undefined` and `null` — they are NOT interchangeable under this setting.
		// Zod's .optional() produces `string | undefined` (field wasn't provided by the client),
		// but Prisma's nullable field (String? in schema) expects `string | null`.
		// Passing `undefined` directly to Prisma would be a type error under exactOptionalPropertyTypes.
		// Fix: use `?? null` to explicitly convert undefined → null before passing to Prisma.
		// This pattern is required on EVERY optional Zod field that maps to a nullable Prisma field.

		return result
		.status(StatusCodes.PROJECT_CREATION_SUCCESSFUL)
		.json({
			message: "Project Created.",
			project: {
				id: project.id,
				name: project.name,
				description: project.description,
				workspaceId: project.workspaceId,
				createdAt: project.createdAt,
			},
		});

	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
				case "P2002": // unique constraint violation
					return result.status(StatusCodes.PROJECT_CREATION_FAILED).json({ error: "Name Already in Use" });
				case "P2003": // foreign key constraint failed
					return result.status(StatusCodes.PROJECT_CREATION_FAILED).json({ error: "Referenced Record Doesn't Exist" });
				case "P2025": // record to update/delete not found
					return result.status(StatusCodes.PROJECT_CREATION_FAILED).json({ error: "Record not Found" });
				default:
					console.error("Unhandled Prisma error:", error.code, error.message);
				return result.status(StatusCodes.PROJECT_CREATION_FAILED).json({ error: "Database Error" });
			}		
		}
		else if (error instanceof Prisma.PrismaClientValidationError) { // this is very rare if zod passes the format
			return result.status(StatusCodes.PROJECT_CREATION_FAILED).json({ error: "Invalid Data | Malformed Data" });
		}
		else { // we just don't know what happened here
			console.error("Unexpected Error Occured in Project Creation", error);
			return result
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: "Project Creation Failed for Unexpected Reasons" });
		}
	}
});

export default ROUTER;
