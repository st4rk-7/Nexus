// backend/routes/deviceRoutes.js
// This file acts as the traffic cop for all device-related URLs.

import express from "express";
import { registerDevice, getDevices } from "../controllers/deviceController.js";

// A "router" is a mini-app inside Express just for routing.
const router = express.Router();

// GET / — list all devices
router.get("/", getDevices);

// POST /register — register a new device
router.post("/register", registerDevice);

export default router;
