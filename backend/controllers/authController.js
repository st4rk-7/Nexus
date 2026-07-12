// backend/controllers/authController.js
// Logic for admin registration and login.

import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

// Small helper: build a signed JWT "badge" for a given admin id.
// The badge carries the admin's id, is signed with our secret, and
// expires in 1 day so a stolen badge doesn't work forever.
function makeToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

// @desc    Register a new admin account
// @route   POST /api/auth/register
export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide a username and password" });
    }

    // No duplicate usernames
    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "That username is already taken" });
    }

    // Create it. The model's pre-save hook hashes the password automatically.
    const admin = await Admin.create({ username, password });

    // Hand back a token so they're logged in immediately after registering.
    res.status(201).json({
      message: "Admin registered successfully",
      username: admin.username,
      token: makeToken(admin._id),
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// @desc    Log in an admin
// @route   POST /api/auth/login
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide a username and password" });
    }

    // Find the admin by username
    const admin = await Admin.findOne({ username });

    // IMPORTANT: give the SAME vague error whether the username is wrong OR
    // the password is wrong. That way an attacker can't tell which usernames
    // actually exist. (401 = Unauthorized.)
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({
      message: "Login successful",
      username: admin.username,
      token: makeToken(admin._id),
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};
