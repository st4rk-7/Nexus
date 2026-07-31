// backend/controllers/firmwareController.js
// Logic for handling firmware uploads and listing.

import { Firmware } from "../models/Firmware.js";
import {
  deleteFirmwareFile,
  openFirmwareDownload,
  storeFirmwareFile,
} from "../services/firmwareStorage.js";
import { isValidVersion } from "../utils/version.js";

// @desc    Upload a new firmware version
// @route   POST /api/firmware
export const uploadFirmware = async (req, res) => {
  try {
    // req.file comes from multer middleware
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a firmware file" });
    }

    const version = req.body.version?.trim();
    const releaseNotes = req.body.releaseNotes?.trim();

    if (!version) {
      return res.status(400).json({ error: "Please provide a version string (e.g., '1.1.0')" });
    }

    if (!isValidVersion(version)) {
      return res.status(400).json({
        error: "Version must use major.minor.patch format (e.g., 1.1.0)",
      });
    }

    // Check if version already exists
    const existing = await Firmware.findOne({ version });
    if (existing) {
      return res.status(400).json({ error: `Firmware version ${version} already exists` });
    }

    // Save the binary in MongoDB GridFS first, then save its metadata.
    const storedFile = await storeFirmwareFile(req.file);
    let newFirmware;

    try {
      newFirmware = await Firmware.create({
        version,
        releaseNotes,
        ...storedFile,
      });
    } catch (error) {
      // If metadata saving fails, remove the uploaded binary so it is not
      // left behind as an unused file.
      await deleteFirmwareFile(storedFile.fileId).catch(() => {});
      throw error;
    }

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

// @desc    Download a specific firmware binary
// @route   GET /api/firmware/:id/download
export const downloadFirmware = async (req, res) => {
  try {
    const { id } = req.params; // Grabs the ':id' part from the URL

    const firmware = await Firmware.findById(id);
    if (!firmware) {
      return res.status(404).json({ error: "Firmware not found" });
    }

    // Firmware uploaded before the GridFS upgrade only has a local path.
    // Those old test files cannot survive a cloud restart.
    if (!firmware.fileId) {
      return res.status(410).json({
        error: "This old local firmware file is no longer available. Upload a new version.",
      });
    }

    res.attachment(firmware.fileName);
    res.setHeader("Content-Type", firmware.contentType);
    res.setHeader("Content-Length", firmware.fileSize);

    const downloadStream = openFirmwareDownload(firmware.fileId);

    downloadStream.once("error", (error) => {
      console.error("Error downloading firmware:", error);
      if (!res.headersSent) {
        res.status(404).json({ error: "Firmware file not found" });
      } else {
        res.destroy(error);
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error initiating download:", error);
    res.status(500).json({ error: "Server error initiating download" });
  }
};
