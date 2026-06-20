// server.js — the entry point of the backend.
// Its only job right now: start an Express web server and answer a health check.
// (Database wiring comes next, in its own step.)

import express from "express";

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

app.listen(PORT, () => {
  console.log(`Nexus backend running on http://localhost:${PORT}`);
});
