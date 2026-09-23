import { randomUUID } from "node:crypto";
import { store } from "../store.js";
import { isValidVersion } from "../utils/version.js";

function metadata({ buffer, ...firmware }) {
  return firmware;
}

export function uploadFirmware(req, res) {
  if (!req.file) return res.status(400).json({ error: "Please upload a firmware file" });
  const { version, releaseNotes = "" } = req.body;
  if (typeof version !== "string" || !isValidVersion(version) || typeof releaseNotes !== "string") {
    return res.status(400).json({ error: "Provide a major.minor.patch version and text release notes" });
  }
  const releases = [...store.firmware.values()];
  if (releases.some((firmware) => firmware.version === version.trim())) {
    return res.status(400).json({ error: `Firmware version ${version.trim()} already exists` });
  }
  // Bound total memory use as uploads are temporary and there is no database.
  if (releases.reduce((size, firmware) => size + firmware.fileSize, 0) + req.file.size > 50 * 1024 * 1024) {
    return res.status(413).json({ error: "Lab storage is full (50 MB). Restart the backend to clear uploads." });
  }
  const firmware = {
    _id: randomUUID(), version: version.trim(), releaseNotes: releaseNotes.trim(),
    fileName: req.file.originalname, contentType: "application/octet-stream",
    fileSize: req.file.size, buffer: req.file.buffer, createdAt: new Date().toISOString(),
  };
  store.firmware.set(firmware._id, firmware);
  res.status(201).json({ message: "Firmware uploaded successfully", firmware: metadata(firmware) });
}

export function getFirmwareVersions(req, res) {
  const firmwares = [...store.firmware.values()].reverse().map(metadata);
  res.json({ count: firmwares.length, firmwares });
}

export function downloadFirmware(req, res) {
  const firmware = store.firmware.get(req.params.id);
  if (!firmware) return res.status(404).json({ error: "Firmware not found" });
  res.attachment(firmware.fileName);
  res.setHeader("Content-Type", firmware.contentType);
  res.send(firmware.buffer);
}
