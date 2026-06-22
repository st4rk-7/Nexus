// server.js — the entry point of the backend.
// It loads our secrets, connects to the database, then starts the web server.

// This MUST be first: it reads the .env file and loads PORT, MONGODB_URI, etc.
// into process.env so the rest of the code can use them.
import "dotenv/config";

import express from "express";
import { connectDB } from "./config/db.js";

// `express()` creates our application — the thing that listens for HTTP
// requests and decides how to respond to each one.
const app = express();

// Middleware: teach Express to read JSON request bodies.
// When a device/admin sends JSON, this turns it into a usable `req.body`.
app.use(express.json());

// --- Routes -------------------------------------------------------------
// A route = (HTTP method + URL) -> a function that builds the response.

// Health check: a trivial endpoint to confirm the server is alive.
// Visit http://localhost:3000/health and you should get this JSON back.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "nexus-backend" });
});

// --- Start the server ---------------------------------------------------
// PORT comes from the environment if set, else default to 3000.
const PORT = process.env.PORT || 3000;

// Connect to the database FIRST, then start listening for requests.
// (No point accepting requests if we can't store/read data.)
await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`Nexus backend running on http://localhost:${PORT}`);
});
