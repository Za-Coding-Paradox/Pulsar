import express from "express";

// returns an application object, that works as a server object (routing, and api calls)
const app = express();

// Automatically parse incoming requrests into objects. Assumes that requests are in JSON format
app.use(express.json());

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

const PORT = process.env.port ?? 3000; // looks for an env file, and gets the port, else chooses default port: 3000
app.listen(PORT, () => {
	console.log(`Pulsar API is running on PORT{ ${PORT} }`);
}); // this tells OS to get any trafic comming to the PORT, hand it to this thread
// this starts the event loop, listening for connections
// when connections are built, the handlers for GET & POST can be used
// just for info, handlers basically mean that the routes/endpoints are mapped to internal routing table on the app server object
