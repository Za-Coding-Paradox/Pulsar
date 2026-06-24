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

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

ROUTER.post("/login", async (request, result) => {
	try {
		const loginRequest = loginSchema.safeParse(request.body);		
		if (!loginRequest.success) {
			return result
			.status(StatusCodes.INVALID_LOGIN_REQUEST)
			.json({
				error: loginRequest.error.flatten()		
			});
		}

		const { email, password } = loginRequest.data;
		
		const user = await PRISMA_CLIENT.user.findUnique({
			where: {
				email: email
			},
		});
		if (!user) {
			return result
			.status(StatusCodes.USER_NOT_FOUND)
			.json({
				error: "Email or Password Entered is Incorrect | User is not Registered in the DataBase",
			})
		}

		const isValidPassword = bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return result
			.status(StatusCodes.PASSWORD_VALIDATION_FAILED)
			.json({
				error: "Email or Password Entered Is Incorrect"
			});
		}

		const accessToken = jwt.sign(
			{ userId: user.id},
			Constants.JWT_ACCESS_SECRET,
			{ expiresIn: Constants.ACCESS_TOKEN_EXPIRY }
		);

		const refreshToken = jwt.sign(
			{ userId: user.id },
			Constants.JWT_REFRESH_SECRET,
			{ expiresIn: Constants.REFRESH_TOKEN_EXPIRY } 
		);
		
		return result
		.status(StatusCodes.LOGIN_SUCCESSFUL)
		.json({
			message: "Login Successful",
			accessToken,
			refreshToken,
			user: { 
				id: user.id,
				email: user.email,
				name: user.name
			}
		});
	}
	catch(error) {
		if (error instanceof Prisma.PrismaClientInitializationError) {
			console.error("Database connection failed:", error);
			return result.status(StatusCodes.DB_CLIENT_INITIALIZATION_FAILED).json({ error: "Service temporarily unavailable" });
		}	

		console.error("Unexpected Error Occured Whilst Login", error);
		return result
		.status(StatusCodes.LOGIN_FAILED)
		.json({
			error: "Login Failed due to Unexpected Reasons"
		});
	}
})

export default ROUTER;
