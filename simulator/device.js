#!/usr/bin/env bun
// simulator/device.js — pretends to be an IoT device and runs the full OTA loop.
// Usage:  bun simulator/device.js
//
// This is the script you demo at the viva. It proves the whole system works
// end-to-end: register → check update → download firmware.

const BASE = process.env.API_URL || "http://localhost:3000";
const DEVICE_NAME = `sim-device-${Date.now()}`; // unique name each run
const DEVICE_TYPE = "temperature-sensor";
const CURRENT_VERSION = "1.0.0"; // the "old" version the device starts with

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   Nexus — Simulated Device (OTA demo)       ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // ── Step 1: Register ─────────────────────────────────────
  console.log(`1. Registering as "${DEVICE_NAME}" (type: ${DEVICE_TYPE})...`);
  const reg = await api("/api/devices/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: DEVICE_NAME, type: DEVICE_TYPE }),
  });
  const apiKey = reg.apiKey;
  console.log(`   ✅ Registered. ID: ${reg.device._id}`);
  console.log(`   🔑 API key received (stored securely on device).\n`);

  // ── Step 2: Check for update ──────────────────────────────
  console.log(`2. Checking for firmware update (currently on v${CURRENT_VERSION})...`);
  const update = await api("/api/devices/check-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ currentFirmwareVersion: CURRENT_VERSION }),
  });

  if (!update.updateAvailable) {
    console.log("   ℹ️  Already up to date. Nothing to download.\n");
    console.log("Done.");
    return;
  }

  console.log(`   🆕 Update available! v${update.latestVersion}`);
  console.log(`   📝 Notes: ${update.releaseNotes}`);
  console.log(`   📥 Download URL: ${update.downloadUrl}\n`);

  // ── Step 3: Download the firmware binary ──────────────────
  console.log("3. Downloading firmware...");
  const dlRes = await fetch(`${BASE}${update.downloadUrl}`);
  if (!dlRes.ok) throw new Error(`Download failed: HTTP ${dlRes.status}`);

  const blob = await dlRes.arrayBuffer();
  const sizeKB = (blob.byteLength / 1024).toFixed(1);
  console.log(`   ✅ Downloaded ${sizeKB} KB.\n`);

  // ── Done ──────────────────────────────────────────────────
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   OTA loop complete:                        ║");
  console.log(`║   ${DEVICE_NAME}`);
  console.log(`║   v${CURRENT_VERSION} → v${update.latestVersion}                        ║`);
  console.log("╚══════════════════════════════════════════════╝");
}

main().catch((err) => {
  console.error("\n❌ Simulation failed:", err.message);
  process.exit(1);
});
