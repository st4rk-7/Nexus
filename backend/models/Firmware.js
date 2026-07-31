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
      match: [
        /^\d+\.\d+\.\d+$/,
        "Version must use major.minor.patch format",
      ],
    },
    // Notes about what changed in this version
    releaseNotes: {
      type: String,
      default: "No notes provided",
    },
    // GridFS stores the binary in MongoDB. We keep its id and safe metadata
    // here so the API can find and download it later.
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      default: "application/octet-stream",
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
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
