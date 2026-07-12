// backend/routes/deviceRoutes.js
// This file acts as the traffic cop for all device-related URLs.

import express from "express";
import { registerDevice, getDevices, checkUpdate } from "../controllers/deviceController.js";
import { deviceAuth } from "../middleware/deviceAuthMiddleware.js";

// A "router" is a mini-app inside Express just for routing.
const router = express.Router();

// GET / — list all devices
router.get("/", getDevices);

// POST /register — register a new device
router.post("/register", registerDevice);

// POST /check-update — device asks if there is a newer firmware.
// `deviceAuth` runs first: the device must send a valid x-api-key header.
router.post("/check-update", deviceAuth, checkUpdate);

export default router;
