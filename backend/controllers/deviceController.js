// backend/controllers/deviceController.js
// This file holds the logic for our device routes.

import { Device } from "../models/Device.js";
import { Firmware } from "../models/Firmware.js"; // We need this to check latest firmware
import { UpdateLog } from "../models/UpdateLog.js";

// Turns database errors into clear 4xx responses instead of a generic 500.
function sendError(res, error, fallbackMessage) {
  // Mongoose schema validation failed (e.g. name too short, bad version format)
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(". ") });
  }
  // A value had the wrong type, e.g. "/api/devices/abc" is not a valid id
  if (error.name === "CastError") {
    const message = error.path === "_id" ? "Invalid id" : `Invalid value for ${error.path}`;
    return res.status(400).json({ error: message });
  }
  // 11000 = MongoDB's "duplicate key" error (the unique name rule)
  if (error.code === 11000) {
    return res.status(409).json({ error: "A device with that name already exists" });
  }
  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

// A device that hasn't checked in for this long counts as offline
const OFFLINE_AFTER_MINUTES = 5;

// Marks devices offline once they stop checking in. Runs before reads so the
// list, filter and sort all see current statuses. (Old records without
// lastSeen fall back to updatedAt.)
async function markSilentDevicesOffline() {
  const cutoff = new Date(Date.now() - OFFLINE_AFTER_MINUTES * 60 * 1000);
  await Device.updateMany(
    {
      status: "online",
      $or: [
        { lastSeen: { $lt: cutoff } },
        { lastSeen: { $exists: false }, updatedAt: { $lt: cutoff } },
      ],
    },
    { status: "offline" },
    { timestamps: false } // a status sweep is not an admin edit
  );
}

// Allowed values for ?sort= on the device list
const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
  status: { status: 1, name: 1 },
};

// @desc    Check if a firmware update is available for a device
// @route   POST /api/devices/check-update
// @access  Device (requires valid x-api-key — set by deviceAuth middleware)
export const checkUpdate = async (req, res) => {
  try {
    // The device is already identified by the deviceAuth middleware — we trust
    // req.device, NOT a name in the body (a name could be faked; the key can't).
    const device = req.device;

    // Checking in proves the device is alive
    device.lastSeen = new Date();
    device.status = "online";
    await device.save();

    // The device tells us what version it's currently running. Fall back to
    // whatever we have on record if it doesn't send one.
    const currentFirmwareVersion =
      req.body.currentFirmwareVersion || device.currentFirmwareVersion;

    // Find the latest active firmware. sort({ createdAt: -1 }) gets newest first.
    const latestFirmware = await Firmware.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!latestFirmware) {
      // No firmware uploaded at all yet
      return res.status(200).json({ updateAvailable: false, message: "No firmware available" });
    }

    // Compare versions (simple check: if it's different, assume it's an update)
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

// @desc    Get all registered devices, with optional search / filter / sort
// @route   GET /api/devices?search=sensor&status=online&sort=name
export const getDevices = async (req, res) => {
  try {
    await markSilentDevicesOffline();
    const { search, status, sort } = req.query;
    const filter = {};

    if (search) {
      // Escape regex symbols so the search text is matched literally,
      // then match it anywhere in the name or type (case-insensitive).
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(escaped, "i");
      filter.$or = [{ name: pattern }, { type: pattern }];
    }
    if (status === "online" || status === "offline") {
      filter.status = status;
    }

    const devices = await Device.find(filter).sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest);

    // Always return an array, even if empty — that way the frontend
    // always knows what shape to expect.
    res.status(200).json({ count: devices.length, devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Server error while fetching devices" });
  }
};

// @desc    Get one device by its id
// @route   GET /api/devices/:id
export const getDeviceById = async (req, res) => {
  try {
    await markSilentDevicesOffline();
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    // The device's install history, newest first, with each firmware's version
    const updates = await UpdateLog.find({ device: device._id })
      .sort({ createdAt: -1 })
      .populate("firmware", "version");
    res.status(200).json({ device, updates });
  } catch (error) {
    sendError(res, error, "Server error while fetching device");
  }
};

// @desc    Edit a device's details
// @route   PUT /api/devices/:id
// @access  Admin (JWT)
export const updateDevice = async (req, res) => {
  try {
    // Only these fields can be edited. The apiKey is never changed here.
    const { name, type, currentFirmwareVersion, status } = req.body;

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { name, type, currentFirmwareVersion, status },
      // returnDocument "after" = send back the updated version.
      // runValidators = apply the same schema rules as when creating.
      { returnDocument: "after", runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.status(200).json({ message: "Device updated", device });
  } catch (error) {
    sendError(res, error, "Server error while updating device");
  }
};

// @desc    Delete a device
// @route   DELETE /api/devices/:id
// @access  Admin (JWT)
export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    // Remove its update history too, so no log points at a missing device
    await UpdateLog.deleteMany({ device: device._id });
    res.status(200).json({ message: `Device "${device.name}" deleted` });
  } catch (error) {
    sendError(res, error, "Server error while deleting device");
  }
};

// @desc    Register a new device
// @route   POST /api/devices/register
export const registerDevice = async (req, res) => {
  try {
    // 1. Unpack the data the device sent us in the JSON body
    const { name, type, currentFirmwareVersion } = req.body;

    // 2. Create the new device and save it to MongoDB.
    // The schema validates the fields (required, length, version format) and the
    // unique index rejects duplicate names; sendError turns those into 400/409.
    const newDevice = await Device.create({
      name,
      type,
      // If they sent a version, use it. Otherwise it defaults to "1.0.0"
      currentFirmwareVersion: currentFirmwareVersion || "1.0.0",
      status: "online",
    });

    // 3. Send success response back to the client (status 201 = Created)
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
    // Bad input -> 400/409; anything else -> 500 so the server doesn't die.
    sendError(res, error, "Server error during registration");
  }
};

// @desc    Device reports that it installed a firmware update
// @route   POST /api/devices/report-update   body: { firmwareId }
// @access  Device (requires valid x-api-key)
export const reportUpdate = async (req, res) => {
  try {
    const device = req.device;
    const firmware = await Firmware.findById(req.body.firmwareId);
    if (!firmware) {
      return res.status(404).json({ error: "Firmware not found" });
    }

    // Record the install, then move the device to the new version
    const log = await UpdateLog.create({
      device: device._id,
      firmware: firmware._id,
      fromVersion: device.currentFirmwareVersion,
    });
    device.currentFirmwareVersion = firmware.version;
    device.lastSeen = new Date();
    device.status = "online";
    await device.save();

    res.status(201).json({
      message: `Device is now on v${firmware.version}`,
      update: log,
    });
  } catch (error) {
    sendError(res, error, "Server error while reporting update");
  }
};
