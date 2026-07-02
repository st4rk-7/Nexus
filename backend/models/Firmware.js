// backend/models/Firmware.js
// This file defines the shape (schema) of a firmware release.

import mongoose from "mongoose";

const firmwareSchema = new mongoose.Schema(
  {
    // E.g., "1.1.0"
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Notes about what changed in this version
    releaseNotes: {
      type: String,
      default: "No notes provided",
    },
    // The path on the server where the actual binary file (.bin) is stored
    filePath: {
      type: String,
      required: true,
    },
    // Whether this version is the latest/active one to hand out
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Firmware = mongoose.model("Firmware", firmwareSchema);
