import jwt from "jsonwebtoken";
import { findAdminById } from "../store.js";

export async function protect(req, res, next) {
  let decoded;
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized — no token provided" });
    }
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Not authorized — invalid or expired token" });
  }

  const admin = await findAdminById(decoded.id);
  if (!admin) {
    return res.status(401).json({ error: "Not authorized — admin no longer exists" });
  }
  req.admin = { _id: admin._id, username: admin.username };
  next();
}
