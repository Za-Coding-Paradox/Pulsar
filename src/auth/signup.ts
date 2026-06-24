import express from "express";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";
import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js";

const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

const signupSchema = z.object ({
	email: z.string().email(),
	name: z.string().min(1),
	password: z.string().min(8)
});

ROUTER.post("/signup", async (request, result) => {
	try {
		const signupRequest = signupSchema.safeParse(request.body); // validates if incoming data is in valid form

		if (!signupRequest.success) {
			return result // we are returning here because we want to exit the funtion, and stop the controll flow. That is the sole purpose of return
			.status(StatusCodes.INVALID_SINGUP_REQUEST)
			.json({ error: signupRequest.error.flatten() });
		} // if failed valid format, infrom requester

		const { email, name, password} = signupRequest.data;
		const hashedPassword = await bcrypt.hash(password, Constants.BCRYPT_COST_FACTOR);

		const user = await PRISMA_CLIENT.user.create({
			data: {
				email: email,
				password: hashedPassword,
				name: name
			}
		}); // trying to create a user
		return result
		.status(StatusCodes.SIGNUP_SUCCESSFUL)
		.json({
			message: "Signup Successful",
			userId: user.id
		}); // if uesr creation is successful 
	}
	catch(error) { // if an error occurs whilst user creation
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
				case "P2002": // unique constraint violation
					return result.status( StatusCodes.USER_CREATION_FAILED ).json({ error: "Email Already in Use" });

				case "P2003": // foreign key constraint failed
					return result.status(StatusCodes.USER_CREATION_FAILED ).json({ error: "Referenced Record Doesn't Exist" });

				case "P2025": // record to update/delete not found
					return result.status( StatusCodes.USER_CREATION_FAILED ).json({ error: "Record not Found" });

				default:
					console.error("Unhandled Prisma error:", error.code, error.message);
				return result.status(StatusCodes.USER_CREATION_FAILED).json({ error: "Database Error" });
			}		
		}
		else if (error instanceof Prisma.PrismaClientValidationError) { // this is very rare if zod passes the format
			return result.status(StatusCodes.USER_CREATION_FAILED).json({ error: "Invalid Data | Malformed Data" });
		}
		else { // we just don't know what happened here
			console.error("Unexpected Error Occured in Signup", error);
			return result.status(StatusCodes.SIGNUP_FAILED).json({ error: "Signup Failed for Unexpected Reasons" });
		}
	}
});

export default ROUTER;
