// backend/routes/deviceRoutes.js
// This file acts as the traffic cop for all device-related URLs.

import express from "express";
import {
  registerDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  checkUpdate,
  reportUpdate,
} from "../controllers/deviceController.js";
import { deviceAuth } from "../middleware/deviceAuthMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

// A "router" is a mini-app inside Express just for routing.
const router = express.Router();

// GET / — list all devices
router.get("/", getDevices);

// POST /register — register a new device
router.post("/register", registerDevice);

// POST /check-update — device asks if there is a newer firmware.
// `deviceAuth` runs first: the device must send a valid x-api-key header.
router.post("/check-update", deviceAuth, checkUpdate);

// POST /report-update — device confirms it installed a firmware version
router.post("/report-update", deviceAuth, reportUpdate);

// GET /:id — one device's details
router.get("/:id", getDeviceById);

// PUT /:id and DELETE /:id — admin-only, so `protect` checks the JWT first
router.put("/:id", protect, updateDevice);
router.delete("/:id", protect, deleteDevice);

export default router;
