import { findDeviceByApiKey } from "../store.js";

export async function deviceAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const device = await findDeviceByApiKey(apiKey);
  if (!device) {
    return res.status(401).json({ error: "Not authorized — invalid or missing device API key" });
  }
  req.device = device;
  next();
}
