// Temporary lab data. Everything resets when the backend restarts.
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

export const store = {
  admin: null,
  devices: new Map(),
  firmware: new Map(),
};

export async function createAdmin(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  // Check after hashing as two registration requests may overlap.
  if (store.admin) return null;
  store.admin = { _id: randomUUID(), username, passwordHash };
  return store.admin;
}

export async function seedAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME && !ADMIN_PASSWORD) return;
  if (!ADMIN_USERNAME?.trim() || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 8 characters");
  }
  await createAdmin(ADMIN_USERNAME.trim(), ADMIN_PASSWORD);
}
