// server.js — the entry point of the backend.
// Load settings, prepare the lab account, then start the web server.

// This MUST be first: it reads the .env file and loads PORT, JWT_SECRET, etc.
// into process.env so the rest of the code can use them.
import "dotenv/config";

import express from "express";
import { seedAdmin } from "./store.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import firmwareRoutes from "./routes/firmwareRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// `express()` creates our application — the thing that listens for HTTP
// requests and decides how to respond to each one.
const app = express();

// Allow the deployed React app to call this API from its own web address.
// Requests without a browser Origin header (curl and IoT devices) still work.
const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5174,http://127.0.0.1:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Origin is not allowed" });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Middleware: teach Express to read JSON request bodies.
// When a device/admin sends JSON, this turns it into a usable `req.body`.
app.use(express.json({ limit: "100kb" }));

// --- Routes -------------------------------------------------------------
// A route = (HTTP method + URL) -> a function that builds the response.

// Plug in the device routes. Any URL starting with `/api/devices` goes there.
app.use("/api/devices", deviceRoutes);

// Plug in the firmware routes.
app.use("/api/firmware", firmwareRoutes);

// Plug in the admin auth routes (register + login).
app.use("/api/auth", authRoutes);

// Health check: a trivial endpoint to confirm the server is alive.
// Visit http://localhost:3001/health and you should get this JSON back.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "nexus-backend" });
});

// One final error handler gives malformed uploads a clear JSON response.
app.use((error, req, res, next) => {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: `Firmware file is too large. Maximum size is ${
        process.env.MAX_FIRMWARE_SIZE_MB || 10
      } MB.`,
    });
  }

  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error("Unhandled server error:", error);
  res.status(500).json({ error: "Unexpected server error" });
});

// --- Start the server ---------------------------------------------------
// PORT comes from the environment if set, else default to 3001.
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required; copy .env.example to .env first");
}

await seedAdmin();

const server = app.listen(PORT, () => {
  console.log(`Nexus backend running on http://localhost:${server.address().port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
