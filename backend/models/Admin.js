// backend/models/Admin.js
// The shape of an admin account. Admins are the humans who log in to
// upload firmware and view devices. Devices are NOT admins.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    // The login name (e.g., "ashwin")
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // The SCRAMBLED password (a bcrypt hash). We never store the real one.
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- Auto-hash the password before saving -------------------------------
// A "pre-save hook" runs right before a document is saved to the database.
// Here we scramble (hash) the password so the plain text never gets stored.
adminSchema.pre("save", async function () {
  // Only re-hash if the password field actually changed.
  // (Otherwise editing other fields later would double-hash it.)
  if (!this.isModified("password")) return;

  // A "salt" is random data mixed in so identical passwords hash differently.
  // 10 = how much work to do (higher = safer but slower).
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- Helper to check a login attempt ------------------------------------
// Given a plain-text password someone typed, hash it and compare to the
// stored hash. Returns true only if they match.
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Admin = mongoose.model("Admin", adminSchema);
