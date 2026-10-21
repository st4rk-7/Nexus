import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { getDatabase, getFirmwareBucket } from "./database.js";

const collection = (name) => getDatabase().collection(name);

export async function createAdmin(username, password) {
  const admin = {
    _id: randomUUID(),
    username,
    passwordHash: await bcrypt.hash(password, 10),
  };
  try {
    await collection("admins").insertOne(admin);
    return admin;
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
}

export function findAdminByUsername(username) {
  return collection("admins").findOne({ username });
}

export function findAdminById(id) {
  return collection("admins").findOne({ _id: id }, { projection: { username: 1 } });
}

export async function seedAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME && !ADMIN_PASSWORD) return;
  if (!ADMIN_USERNAME?.trim() || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 8 characters");
  }
  await createAdmin(ADMIN_USERNAME.trim(), ADMIN_PASSWORD);
}

export async function createDevice({ name, type, currentFirmwareVersion }) {
  const now = new Date().toISOString();
  const device = {
    _id: randomUUID(),
    name,
    type,
    apiKey: randomBytes(32).toString("hex"),
    currentFirmwareVersion,
    status: "online",
    createdAt: now,
    lastSeenAt: now,
  };
  try {
    await collection("devices").insertOne(device);
    return device;
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
}

export function findDeviceByApiKey(apiKey) {
  return collection("devices").findOne({ apiKey });
}

export async function listDevices() {
  return collection("devices").find().sort({ createdAt: -1 }).toArray();
}

export function updateDeviceCheckIn(id, currentFirmwareVersion) {
  return collection("devices").findOneAndUpdate(
    { _id: id },
    { $set: { currentFirmwareVersion, lastSeenAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );
}

export async function createFirmware({ version, releaseNotes, fileName, contentType, buffer }) {
  const bucket = getFirmwareBucket();
  const id = randomUUID();
  const upload = bucket.openUploadStreamWithId(id, fileName, { contentType });
  await new Promise((resolve, reject) => {
    upload.once("error", reject);
    upload.once("finish", resolve);
    upload.end(buffer);
  });

  const firmware = {
    _id: id,
    version,
    releaseNotes,
    fileName,
    contentType,
    fileSize: buffer.length,
    createdAt: new Date().toISOString(),
  };
  try {
    await collection("firmware").insertOne(firmware);
    return firmware;
  } catch (error) {
    await bucket.delete(id).catch(() => {});
    if (error?.code === 11000) return null;
    throw error;
  }
}

export function listFirmware() {
  return collection("firmware").find().sort({ createdAt: -1 }).toArray();
}

export function findFirmwareById(id) {
  return collection("firmware").findOne({ _id: id });
}

export function openFirmwareDownload(id) {
  return getFirmwareBucket().openDownloadStream(id);
}

export async function getFirmwareStorageSize() {
  const result = await collection("firmware").aggregate([
    { $group: { _id: null, total: { $sum: "$fileSize" } } },
  ]).toArray();
  return result[0]?.total ?? 0;
}
