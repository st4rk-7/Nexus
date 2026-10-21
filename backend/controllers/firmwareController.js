import {
  createFirmware as saveFirmware,
  findFirmwareById,
  getFirmwareStorageSize,
  listFirmware,
  openFirmwareDownload,
} from "../store.js";
import { isValidVersion } from "../utils/version.js";

function metadata({ buffer, ...firmware }) {
  return firmware;
}

export async function uploadFirmware(req, res) {
  if (!req.file) return res.status(400).json({ error: "Please upload a firmware file" });
  const { version, releaseNotes = "" } = req.body;
  if (typeof version !== "string" || !isValidVersion(version) || typeof releaseNotes !== "string") {
    return res.status(400).json({ error: "Provide a major.minor.patch version and text release notes" });
  }
  if (await getFirmwareStorageSize() + req.file.size > 50 * 1024 * 1024) {
    return res.status(413).json({ error: "Lab storage is full (50 MB)." });
  }
  const firmware = await saveFirmware({
    version: version.trim(),
    releaseNotes: releaseNotes.trim(),
    fileName: req.file.originalname,
    contentType: "application/octet-stream",
    buffer: req.file.buffer,
  });
  if (!firmware) return res.status(400).json({ error: `Firmware version ${version.trim()} already exists` });
  res.status(201).json({ message: "Firmware uploaded successfully", firmware: metadata(firmware) });
}

export async function getFirmwareVersions(req, res) {
  const firmwares = (await listFirmware()).map(metadata);
  res.json({ count: firmwares.length, firmwares });
}

export async function downloadFirmware(req, res, next) {
  const firmware = await findFirmwareById(req.params.id);
  if (!firmware) return res.status(404).json({ error: "Firmware not found" });
  res.attachment(firmware.fileName);
  res.setHeader("Content-Type", firmware.contentType);
  const download = openFirmwareDownload(firmware._id);
  download.once("error", next);
  download.pipe(res);
}
