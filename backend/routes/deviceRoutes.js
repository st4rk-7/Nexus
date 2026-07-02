// backend/routes/deviceRoutes.js
// This file acts as the traffic cop for all device-related URLs.

import express from "express";
import { registerDevice, getDevices, checkUpdate } from "../controllers/deviceController.js";

// A "router" is a mini-app inside Express just for routing.
const router = express.Router();

// GET / — list all devices
router.get("/", getDevices);

// POST /register — register a new device
router.post("/register", registerDevice);

// POST /check-update — device asks if there is a newer firmware
router.post("/check-update", checkUpdate);

export default router;
