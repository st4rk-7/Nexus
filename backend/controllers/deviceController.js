// backend/controllers/deviceController.js
// This file holds the logic for our device routes.

import { Device } from "../models/Device.js";

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
