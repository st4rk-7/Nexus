// backend/controllers/firmwareController.js
// Logic for handling firmware uploads and listing.

import { Firmware } from "../models/Firmware.js";
import path from "path";
import fs from "fs";

// Multer has already saved the file by the time we validate, so a rejected
// upload must delete it or uploads/ fills with orphan files.
function rejectUpload(req, res, status, message) {
  if (req.file) fs.rmSync(req.file.path, { force: true });
  return res.status(status).json({ error: message });
}

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
      return rejectUpload(req, res, 400, "Please provide a version string (e.g., '1.1.0')");
    }

    // Check if version already exists
    const existing = await Firmware.findOne({ version });
    if (existing) {
      return rejectUpload(req, res, 409, `Firmware version ${version} already exists`);
    }

    // Save the file path so we know where to find it for download later
    const newFirmware = await Firmware.create({
      version,
      releaseNotes,
      filePath: req.file.path,
      uploadedBy: req.admin._id, // set by the `protect` middleware
    });

    res.status(201).json({
      message: "Firmware uploaded successfully",
      firmware: newFirmware,
    });
  } catch (error) {
    // Schema rules (e.g. version format) failed -> the client sent bad data
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return rejectUpload(req, res, 400, messages.join(". "));
    }
    console.error("Error uploading firmware:", error);
    rejectUpload(req, res, 500, "Server error during upload");
  }
};

// @desc    Get all firmware versions
// @route   GET /api/firmware
export const getFirmwareVersions = async (req, res) => {
  try {
    // Sort descending by creation date so newest is first
    // populate() swaps the uploadedBy id for the admin's username
    const firmwares = await Firmware.find({})
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "username");
    res.status(200).json({ count: firmwares.length, firmwares });
  } catch (error) {
    console.error("Error fetching firmware:", error);
    res.status(500).json({ error: "Server error while fetching firmware" });
  }
};

// @desc    Download a specific firmware binary
// @route   GET /api/firmware/:id/download
export const downloadFirmware = async (req, res) => {
  try {
    const { id } = req.params; // Grabs the ':id' part from the URL

    const firmware = await Firmware.findById(id);
    if (!firmware) {
      return res.status(404).json({ error: "Firmware not found" });
    }
    // The record can outlive its file (e.g. uploads/ was cleared), so check first
    if (!firmware.filePath || !fs.existsSync(firmware.filePath)) {
      return res.status(404).json({ error: `The file for firmware v${firmware.version} is missing on the server` });
    }

    // Tell Express to serve the file.
    // Express uses `path.resolve` to find the exact file on the hard drive.
    res.download(path.resolve(firmware.filePath), (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        // If headers are already sent, we can't send a JSON error.
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to download file" });
        }
      }
    });
  } catch (error) {
    console.error("Error initiating download:", error);
    res.status(500).json({ error: "Server error initiating download" });
  }
};
