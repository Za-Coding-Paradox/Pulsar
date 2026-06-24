import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Constants } from ".././globals/constants.js";
import StatusCodes from ".././globals/status_codes.js";

function requireAuth(request: Request, response: Response, nextFunc: NextFunction): void {
	try {
		/*
		   Reads the raw Authorization header from the request. 
		   If the client sent Authorization: Bearer eyJhbG..., this is the full string "Bearer eyJhbG...". If they sent nothing, this is undefined.
		   */
		const authHeader = request.headers.authorization;

		/*
		   Splits "Bearer eyJhbG..." on the space, giving ["Bearer", "eyJhbG..."], then takes index [1] — the actual token. 
		   The ?. means "only call .split() if authHeader isn't undefined" — if the header was missing, token is undefined rather than crashing.
		   */
		const authToken = authHeader?.split(" ")[1];

		if (!authToken) {
			response	
			.status(StatusCodes.AUTH_TOKEN_NOT_FOUND)
			.json({
				error: "No Token Found For Request Authorization."
			});
			return;
		}

		/*
		 * The core verification step: jwt.verify does two things simultaneously: checks that the token's signature was made with JWT_ACCESS_SECRET 
		 * (proving your server issued it, not someone else), and checks that it hasn't expired. If either check fails, it throws — execution jumps to catch. 
		 * If both pass, it returns the payload you embedded at login time — { userId: "...", iat: ..., exp: ... }. 
		 * The as { userId: string } tells TypeScript the shape of that payload (TypeScript can't infer this since it doesn't know what you put in the token at sign time). 
		 */
		const decoded = jwt.verify(authToken, Constants.JWT_ACCESS_SECRET) as { userId: string };

		/* 
		 * Attaches the verified userId to the request object so every downstream route handler can read it via req.user.userId — without making another database call. 
		 * This is the "passing context forward" step — middleware enriches the request, and everything after it benefits from that enrichment.
		 */
		request.user = { userId: decoded.userId }; // this maps the request for the server into the payload that the user sent
		nextFunc(); // tells the server(express) the middleware is done, and calls to re-route the request to the actual endpoint after authentication is successful.
	}
	catch(error) {
		if (error instanceof jwt.TokenExpiredError) {
			response
			.status(StatusCodes.AUTH_TOKEN_EXPIRED)
			.json({
				error: "The Auth Token Expired."
			});
			return;
		}
		else if (error instanceof jwt.NotBeforeError) {
			response
			.status(StatusCodes.AUTH_TOKEN_NOT_BEFORE_VALID)
			.json({
				error: "The Auth Token isn't Yet Valid."
			})
		}

		response
		.status(StatusCodes.AUTH_TOKEN_INVALID)
		.json({
			error: "The Auth Token is Invalid."
		})
	}
}

export default requireAuth;
