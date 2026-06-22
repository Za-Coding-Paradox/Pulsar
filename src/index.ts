// src/index.ts — entry point, nothing else
import "dotenv/config";
import app from "./app/app.js";

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Pulsar API running on port ${PORT}`);
});
