// backend/models/Device.js
// This file defines the shape (schema) of a device in our database.
// Mongoose uses this to ensure every device has the required fields
// and doesn't store garbage data.

import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    // The human-readable name of the device (e.g., "sensor-01")
    name: {
      type: String,
      required: true,
      unique: true, // No two devices can have the same name
      trim: true,
    },
    // What kind of device it is
    type: {
      type: String,
      required: true,
    },
    // The current firmware version running on the device.
    // When a device first registers, it starts at "1.0.0".
    currentFirmwareVersion: {
      type: String,
      default: "1.0.0",
    },
    // Whether the device is currently "online" or "offline"
    status: {
      type: String,
      enum: ["online", "offline"], // Only these two words are allowed
      default: "online",
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` timestamps to every record.
    timestamps: true,
  }
);

// We export the model. When we want to save/find devices, we use this `Device` object.
export const Device = mongoose.model("Device", deviceSchema);
