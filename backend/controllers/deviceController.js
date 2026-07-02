// backend/controllers/deviceController.js
// This file holds the logic for our device routes.

import { Device } from "../models/Device.js";
import { Firmware } from "../models/Firmware.js"; // We need this to check latest firmware

// @desc    Check if a firmware update is available for a device
// @route   POST /api/devices/check-update
export const checkUpdate = async (req, res) => {
  try {
    const { name, currentFirmwareVersion } = req.body;

    if (!name || !currentFirmwareVersion) {
      return res.status(400).json({ error: "Please provide name and currentFirmwareVersion" });
    }

    // 1. Find the device to make sure it exists
    const device = await Device.findOne({ name });
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // 2. Find the latest active firmware
    // sort({ createdAt: -1 }) gets newest first
    const latestFirmware = await Firmware.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!latestFirmware) {
      // No firmware uploaded at all yet
      return res.status(200).json({ updateAvailable: false, message: "No firmware available" });
    }

    // 3. Compare versions (simple check: if it's different, assume it's an update)
    if (latestFirmware.version !== currentFirmwareVersion) {
      return res.status(200).json({
        updateAvailable: true,
        latestVersion: latestFirmware.version,
        firmwareId: latestFirmware._id,
        downloadUrl: `/api/firmware/${latestFirmware._id}/download`,
        releaseNotes: latestFirmware.releaseNotes
      });
    }

    // If versions match
    res.status(200).json({ updateAvailable: false, message: "Device is up to date" });

  } catch (error) {
    console.error("Error checking update:", error);
    res.status(500).json({ error: "Server error checking update" });
  }
};

// @desc    Get all registered devices
// @route   GET /api/devices
export const getDevices = async (req, res) => {
  try {
    // Find ALL devices in the database (empty filter = grab everything).
    // `.sort({ createdAt: -1 })` puts the newest devices first.
    const devices = await Device.find({}).sort({ createdAt: -1 });

    // Always return an array, even if empty — that way the frontend
    // always knows what shape to expect.
    res.status(200).json({ count: devices.length, devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Server error while fetching devices" });
  }
};

// @desc    Register a new device
// @route   POST /api/devices/register
export const registerDevice = async (req, res) => {
  try {
    // 1. Unpack the data the device sent us in the JSON body
    const { name, type, currentFirmwareVersion } = req.body;

    // 2. Validate input: make sure they didn't leave 'name' or 'type' blank
    if (!name || !type) {
      // 400 Bad Request = "You sent bad data"
      return res.status(400).json({ error: "Please provide a name and type" });
    }

    // 3. Check if a device with this name already exists in the database
    const deviceExists = await Device.findOne({ name });
    if (deviceExists) {
      return res.status(400).json({ error: "A device with that name already exists" });
    }

    // 4. Create the new device and save it to MongoDB
    // We pass the data to Mongoose, and `await` ensures we wait for the save to finish.
    const newDevice = await Device.create({
      name,
      type,
      // If they sent a version, use it. Otherwise it defaults to "1.0.0"
      currentFirmwareVersion: currentFirmwareVersion || "1.0.0",
      status: "online",
    });

    // 5. Send success response back to the client (status 201 = Created)
    res.status(201).json({
      message: "Device registered successfully",
      device: newDevice,
    });

  } catch (error) {
    // If the database crashes or something goes wrong, catch it here so the server doesn't die.
    console.error("Error registering device:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};
