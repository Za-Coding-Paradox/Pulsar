// src/types/express.d.ts
import { Request } from "express";

declare global {
	namespace Express {
		interface Request {
			user?: { userId: string };
			workspace?: { workspaceId: string };
		};
	} // extends the express request interface globally, now we can use user_id in express request handlers
}
export {};
