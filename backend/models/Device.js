// backend/models/Device.js
// This file defines the shape (schema) of a device in our database.
// Mongoose uses this to ensure every device has the required fields
// and doesn't store garbage data.

import mongoose from "mongoose";
import crypto from "crypto";

const deviceSchema = new mongoose.Schema(
  {
    // The human-readable name of the device (e.g., "sensor-01")
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true, // No two devices can have the same name
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
      match: [/^[A-Za-z0-9 _.-]+$/, "Name may only contain letters, numbers, spaces, - _ ."],
    },
    // What kind of device it is (e.g., "ESP32", "temperature-sensor")
    type: {
      type: String,
      required: [true, "Type is required"],
      trim: true,
      maxlength: [40, "Type must be at most 40 characters"],
    },
    // A secret key this device uses to prove who it is when checking in.
    // Auto-generated at creation: 32 random bytes as a hex string.
    // Think of it as the device's password.
    // `select: false` = hidden by default, so listing devices never leaks
    // everyone's keys. We ask for it explicitly only when we need to verify.
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    // The current firmware version running on the device.
    // When a device first registers, it starts at "1.0.0".
    currentFirmwareVersion: {
      type: String,
      default: "1.0.0",
      trim: true,
      match: [/^\d+\.\d+\.\d+$/, "Firmware version must look like 1.2.0"],
    },
    // Whether the device is currently "online" or "offline"
    status: {
      type: String,
      // Only these two words are allowed
      enum: { values: ["online", "offline"], message: "Status must be online or offline" },
      default: "online",
    },
    // When the device last talked to the server (register, check-update,
    // report-update). Devices silent for too long are marked offline.
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` timestamps to every record.
    timestamps: true,
  }
);

// We export the model. When we want to save/find devices, we use this `Device` object.
export const Device = mongoose.model("Device", deviceSchema);
