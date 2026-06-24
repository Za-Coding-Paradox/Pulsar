import express from "express";
import authRouter from ".././auth/index.js"
import { requireAuth } from ".././middleware/require_auth.js";

// returns an application object, that works as a server object (routing, and api calls)
const app = express();

// Automatically parse incoming requrests into objects. Assumes that requests are in JSON format
app.use(express.json());
app.use("/auth", authRouter); // Adds a ROUTER to auth endpoints to APP

app.get("/protected", requireAuth, (req, res) => {
  res.json({ message: "You are in", userId: req.user?.userId });
});


/*
This entire segment was written at the start of the program to understand express.
Now there is no need for this, and it will be removed in main release app (hopefully :) )

// GET Endpoint for the app server
app.get("/", (request, result) => {
	result.json({ 
		message: "The GET request was received",
		status: "true" 
	}); // result is an open connection that you send values into.
	// once you have made an operation on result, you can't touch it back. The connection stops
	// the reason we are not using request here is because, we don't need the request.
	// this is because its a GET endpoint, and request is a incoming input, and we don't need it for this specific endpoint
});

app.post("/", (request, result) => {
	const requestTitle = request.body.name; // fetching the TITLE of the request
	console.log(request.body); // printing the recieved request on console

	result.json({
		message: "Request Recieved",
		title: "request.title"
	}); // sending back acknowledgment signal
});
*/

export default app; // exports the app (reveals the endpoint for the app to be used in main index.ts)
