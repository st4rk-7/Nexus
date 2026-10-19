// backend/middleware/authMiddleware.js
// A "gate" that runs BEFORE protected routes. It checks the admin's JWT badge.
// If the badge is valid, the request continues. If not, it's rejected.

import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

export const protect = async (req, res, next) => {
  try {
    // The badge is sent in a header like:  Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized — no token provided" });
    }

    // Strip off the word "Bearer " to get just the token string.
    const token = authHeader.split(" ")[1];

    // Verify the signature using our secret. If the token was forged or
    // expired, jwt.verify throws and we land in the catch block below.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // The token carries the admin's id. Look them up and attach to the
    // request so the route handler knows WHO is making the call.
    // `.select("-password")` means "everything except the password hash".
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ error: "Not authorized — admin no longer exists" });
    }

    req.admin = admin;

    // `next()` = "gate passed, continue to the actual route handler".
    next();
  } catch (error) {
    return res.status(401).json({ error: "Not authorized — invalid or expired token" });
  }
};
