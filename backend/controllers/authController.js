import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createAdmin, store } from "../store.js";

function session(admin) {
  return {
    username: admin.username,
    token: jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" }),
  };
}

export async function registerAdmin(req, res) {
  if (process.env.ALLOW_ADMIN_REGISTRATION !== "true") {
    return res.status(403).json({ error: "Admin registration is closed" });
  }
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Provide a username and a password of at least 8 characters" });
  }
  const admin = await createAdmin(username.trim(), password);
  if (!admin) return res.status(403).json({ error: "The first admin already exists" });
  res.status(201).json({ message: "Admin registered successfully", ...session(admin) });
}

export async function loginAdmin(req, res) {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Please provide a username and password" });
  }
  const admin = store.admin;
  if (!admin || admin.username !== username.trim() ||
      !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  res.json({ message: "Login successful", ...session(admin) });
}
