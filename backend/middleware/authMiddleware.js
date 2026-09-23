import jwt from "jsonwebtoken";
import { store } from "../store.js";

export function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized — no token provided" });
    }
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (!store.admin || store.admin._id !== decoded.id) {
      return res.status(401).json({ error: "Not authorized — admin no longer exists" });
    }
    req.admin = { _id: store.admin._id, username: store.admin.username };
    next();
  } catch {
    res.status(401).json({ error: "Not authorized — invalid or expired token" });
  }
}
