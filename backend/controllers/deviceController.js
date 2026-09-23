import { randomBytes, randomUUID } from "node:crypto";
import { store } from "../store.js";
import { compareVersions, isValidVersion } from "../utils/version.js";

function publicDevice({ apiKey, ...device }) {
  return device;
}

export function registerDevice(req, res) {
  const { name, type, currentFirmwareVersion = "1.0.0" } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || typeof type !== "string" || !type.trim()) {
    return res.status(400).json({ error: "Please provide a name and type" });
  }
  if (typeof currentFirmwareVersion !== "string" || !isValidVersion(currentFirmwareVersion)) {
    return res.status(400).json({ error: "currentFirmwareVersion must use major.minor.patch format" });
  }
  if ([...store.devices.values()].some((device) => device.name === name.trim())) {
    return res.status(400).json({ error: "A device with that name already exists" });
  }
  const device = {
    _id: randomUUID(), name: name.trim(), type: type.trim(),
    apiKey: randomBytes(32).toString("hex"),
    currentFirmwareVersion: currentFirmwareVersion.trim(), status: "online",
    createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(),
  };
  store.devices.set(device._id, device);
  res.status(201).json({
    message: "Device registered successfully. Save your apiKey — it won't be shown again.",
    device: publicDevice(device), apiKey: device.apiKey,
  });
}

export function getDevices(req, res) {
  const offlineAfterMs = Number(process.env.DEVICE_OFFLINE_AFTER_MINUTES || 5) * 60 * 1000;
  const devices = [...store.devices.values()].reverse().map((device) => ({
    ...publicDevice(device),
    status: Date.now() - new Date(device.lastSeenAt).getTime() <= offlineAfterMs ? "online" : "offline",
  }));
  res.json({ count: devices.length, devices });
}

export function checkUpdate(req, res) {
  const device = req.device;
  const version = req.body?.currentFirmwareVersion ?? device.currentFirmwareVersion;
  if (typeof version !== "string" || !isValidVersion(version)) {
    return res.status(400).json({ error: "currentFirmwareVersion must use major.minor.patch format" });
  }
  device.currentFirmwareVersion = version.trim();
  device.lastSeenAt = new Date().toISOString();
  const latest = [...store.firmware.values()]
    .sort((a, b) => compareVersions(b.version, a.version))[0];
  if (!latest || compareVersions(latest.version, version) <= 0) {
    return res.json({ updateAvailable: false, message: latest ? "Device is up to date" : "No firmware available" });
  }
  res.json({
    updateAvailable: true, latestVersion: latest.version, firmwareId: latest._id,
    downloadUrl: `/api/firmware/${latest._id}/download`, releaseNotes: latest.releaseNotes,
  });
}
