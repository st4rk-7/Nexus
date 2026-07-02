// backend/controllers/firmwareController.js
// Logic for handling firmware uploads and listing.

import { Firmware } from "../models/Firmware.js";
import path from "path";

// @desc    Upload a new firmware version
// @route   POST /api/firmware
export const uploadFirmware = async (req, res) => {
  try {
    // req.file comes from multer middleware
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a firmware file" });
    }

    const { version, releaseNotes } = req.body;
    if (!version) {
      return res.status(400).json({ error: "Please provide a version string (e.g., '1.1.0')" });
    }

    // Check if version already exists
    const existing = await Firmware.findOne({ version });
    if (existing) {
      return res.status(400).json({ error: `Firmware version ${version} already exists` });
    }

    // Usually when we upload a new firmware, we might want to make older ones inactive.
    // For now, let's just save it.
    
    // Save the file path so we know where to find it for download later
    const newFirmware = await Firmware.create({
      version,
      releaseNotes,
      filePath: req.file.path,
    });

    res.status(201).json({
      message: "Firmware uploaded successfully",
      firmware: newFirmware,
    });
  } catch (error) {
    console.error("Error uploading firmware:", error);
    res.status(500).json({ error: "Server error during upload" });
  }
};

// @desc    Get all firmware versions
// @route   GET /api/firmware
export const getFirmwareVersions = async (req, res) => {
  try {
    // Sort descending by creation date so newest is first
    const firmwares = await Firmware.find({}).sort({ createdAt: -1 });
    res.status(200).json({ count: firmwares.length, firmwares });
  } catch (error) {
    console.error("Error fetching firmware:", error);
    res.status(500).json({ error: "Server error while fetching firmware" });
  }
};
