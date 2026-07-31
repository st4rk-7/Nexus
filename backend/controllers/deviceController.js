// backend/controllers/deviceController.js
// This file holds the logic for our device routes.

import { Device } from "../models/Device.js";
import { Firmware } from "../models/Firmware.js"; // We need this to check latest firmware
import { compareVersions, isValidVersion } from "../utils/version.js";

// @desc    Check if a firmware update is available for a device
// @route   POST /api/devices/check-update
// @access  Device (requires valid x-api-key — set by deviceAuth middleware)
export const checkUpdate = async (req, res) => {
  try {
    // The device is already identified by the deviceAuth middleware — we trust
    // req.device, NOT a name in the body (a name could be faked; the key can't).
    const device = req.device;

    // The device tells us what version it's currently running. Fall back to
    // whatever we have on record if it doesn't send one.
    const currentFirmwareVersion =
      req.body.currentFirmwareVersion || device.currentFirmwareVersion;

    if (!isValidVersion(currentFirmwareVersion)) {
      return res.status(400).json({
        error: "currentFirmwareVersion must use major.minor.patch format",
      });
    }

    // Record this check-in so the dashboard can calculate online/offline status.
    await Device.updateOne(
      { _id: device._id },
      {
        currentFirmwareVersion,
        status: "online",
        lastSeenAt: new Date(),
      }
    );

    // GridFS-backed releases survive cloud restarts. Older local-only test
    // uploads are ignored because their files cannot be deployed safely.
    const availableFirmware = await Firmware.find({
      isActive: true,
      fileId: { $exists: true },
    });

    const latestFirmware = availableFirmware.sort((left, right) =>
      compareVersions(right.version, left.version)
    )[0];

    if (!latestFirmware) {
      // No firmware uploaded at all yet
      return res.status(200).json({ updateAvailable: false, message: "No firmware available" });
    }

    // Offer only a genuinely newer version. Never accidentally downgrade.
    if (compareVersions(latestFirmware.version, currentFirmwareVersion) > 0) {
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
    const devices = await Device.find({}).sort({ createdAt: -1 }).lean();

    const offlineAfterMs =
      Number(process.env.DEVICE_OFFLINE_AFTER_MINUTES || 5) * 60 * 1000;
    const now = Date.now();

    const devicesWithStatus = devices.map((device) => {
      const lastSeen = device.lastSeenAt || device.updatedAt || device.createdAt;
      const status =
        now - new Date(lastSeen).getTime() <= offlineAfterMs
          ? "online"
          : "offline";

      return { ...device, status };
    });

    // Always return an array, even if empty — that way the frontend
    // always knows what shape to expect.
    res.status(200).json({
      count: devicesWithStatus.length,
      devices: devicesWithStatus,
    });
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
    const initialFirmwareVersion = currentFirmwareVersion || "1.0.0";

    // 2. Validate input: make sure they didn't leave 'name' or 'type' blank
    if (!name || !type) {
      // 400 Bad Request = "You sent bad data"
      return res.status(400).json({ error: "Please provide a name and type" });
    }

    if (!isValidVersion(initialFirmwareVersion)) {
      return res.status(400).json({
        error: "currentFirmwareVersion must use major.minor.patch format",
      });
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
      currentFirmwareVersion: initialFirmwareVersion,
      status: "online",
    });

    // 5. Send success response back to the client (status 201 = Created)
    // We return the apiKey ONCE here — the device must save it now, because
    // it's hidden (select:false) on every future read. Like a password shown once.
    res.status(201).json({
      message: "Device registered successfully. Save your apiKey — it won't be shown again.",
      device: {
        _id: newDevice._id,
        name: newDevice.name,
        type: newDevice.type,
        currentFirmwareVersion: newDevice.currentFirmwareVersion,
        status: newDevice.status,
      },
      apiKey: newDevice.apiKey,
    });

  } catch (error) {
    // If the database crashes or something goes wrong, catch it here so the server doesn't die.
    console.error("Error registering device:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};
