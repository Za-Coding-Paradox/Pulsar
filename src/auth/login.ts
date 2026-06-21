import express from "express";
import { PrismaClient, Prisma } from ".././generated/prisma/client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";

const COST_FACTOR = 12;
const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

ROUTER.post("/login", async (request, result) => {
	try {
		
	}
	catch(error) {

	}
})
