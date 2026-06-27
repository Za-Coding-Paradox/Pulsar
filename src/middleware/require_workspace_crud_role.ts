// src/middleware/require_workspace_crud_role.ts
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/index.js";
import prisma from "../lib/prisma.js";
import StatusCodes from "../globals/status_codes.js";

// factory function — returns a middleware configured for a specific minimum role
// usage: requireWorkspaceRole("ADMIN") or requireWorkspaceRole("OWNER")
export function requireWorkspaceRole(minimumRole: "OWNER" | "ADMIN" | "MEMBER") {
	return async function(request: Request, response: Response, nextFunc: NextFunction): Promise<void> {
		try {
			const workspaceId = request.params.workspaceId as string;
			const userId = request.user?.userId as string;

			if (!userId || !workspaceId) {
				response.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized." });
				return;
			}

			const membership = await prisma.workspaceMember.findUnique({
				where: { userId_workspaceId: { userId, workspaceId } },
			});

			if (!membership) {
				response.status(StatusCodes.FORBIDDEN).json({ error: "Not a workspace member." });
				return;
			}

			// role hierarchy — OWNER > ADMIN > MEMBER
			const roleHierarchy = { OWNER: 3, ADMIN: 2, MEMBER: 1 };

			if (roleHierarchy[membership.role] < roleHierarchy[minimumRole]) {
				response
				.status(StatusCodes.UNAUTHORIZED)
				.json({ error: `Requires ${minimumRole} role or higher.` });
				return;
			}

			nextFunc();

		} catch (error) {
			if (error instanceof Prisma.PrismaClientInitializationError) {
				response.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable." });
				return;
			}
			response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Role check failed." });
		}
	};
}
