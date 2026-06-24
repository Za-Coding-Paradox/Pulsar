import express from "express";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js" 

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const ROUTER = Router();

ROUTER.post("/refresh", async(request, result) => {
	try {
		const refreshRequest = refreshSchema.safeParse(request.body);
		if (!refreshRequest.success) {
			return result 
			.status(StatusCodes.REFRESH_TOKEN_EXPIRED)
			.json({
				error: "Refresh token required"
			});
		} // check if the refresh token is valid

		const { refreshToken } = refreshRequest.data;

		const decoded = jwt.verify(refreshToken, Constants.JWT_REFRESH_SECRET) as { userId: string };

		const newAccessToken = jwt.sign(
			{ userId: decoded.userId },
			Constants.JWT_ACCESS_SECRET,
			{ expiresIn: Constants.ACCESS_TOKEN_EXPIRY }
		); // create a fresh Access Token
		
		return result.status(StatusCodes.NEW_ACCESS_TOKEN_CREATED).json({
			message: "Access Token Created.",
			accessToken: newAccessToken,
		});
	}
	catch(error) {
		if (error instanceof jwt.TokenExpiredError) {
			// refresh token itself has expired — user must log in again
			return result
			.status(StatusCodes.REFRESH_TOKEN_EXPIRED)
			.json({
				error: "Refresh Token Expired, Please LogIn Again.",
			});
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return result
			.status(StatusCodes.REFRESH_TOKEN_INVALID)
			.json({
				error: "Invalid Refresh Token.",
			});
		}
		return result
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({
			error: "Token Refresh Failed, Due To Internal Server Error.",
		});
	}
});

export default ROUTER;
