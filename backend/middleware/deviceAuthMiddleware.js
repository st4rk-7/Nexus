// backend/middleware/deviceAuthMiddleware.js
// A gate for DEVICE requests (not admins). Devices prove who they are with
// their secret apiKey, sent in an "x-api-key" header.

import { Device } from "../models/Device.js";

export const deviceAuth = async (req, res, next) => {
  try {
    // Devices send their key in a custom header: x-api-key: <the key>
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "Not authorized — no device API key provided" });
    }

    // Find the device with this key. apiKey is select:false in the model,
    // so we must ask for it explicitly with .select("+apiKey").
    const device = await Device.findOne({ apiKey }).select("+apiKey");
    if (!device) {
      return res.status(401).json({ error: "Not authorized — invalid device API key" });
    }

    // Attach the device so the route handler knows exactly which device
    // is calling — it doesn't need to trust a name in the body anymore.
    req.device = device;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Not authorized — device auth failed" });
  }
};
