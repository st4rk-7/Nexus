// backend/models/UpdateLog.js
// One record per firmware install a device reports. It links the two main
// entities: a Device has many UpdateLogs, a Firmware has many UpdateLogs.

import mongoose from "mongoose";

const updateLogSchema = new mongoose.Schema(
  {
    // Which device installed the update (foreign key -> devices._id)
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true, // we look logs up by device on the detail screen
    },
    // Which firmware it installed (foreign key -> firmwares._id)
    firmware: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firmware",
      required: true,
    },
    // The version the device was on before, e.g. "1.0.0"
    fromVersion: {
      type: String,
      required: true,
    },
  },
  {
    // createdAt = when the install was reported
    timestamps: true,
  }
);

export const UpdateLog = mongoose.model("UpdateLog", updateLogSchema);
