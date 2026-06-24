import express from "express";
import { PrismaClient, Prisma } from "../.././generated/prisma/client.js";
import { Router } from "express";
import { z } from "zod";
import StatusCodes from ".././globals/status_codes.js";
import { Constants } from ".././globals/constants.js" 

const ROUTER = Router();
const PRISMA_CLIENT = new PrismaClient();

const listWorkspaceSchema = z.object({
	id: z.string(),
});
