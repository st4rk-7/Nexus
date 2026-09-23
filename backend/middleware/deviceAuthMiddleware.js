import { store } from "../store.js";

export function deviceAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const device = [...store.devices.values()].find((item) => item.apiKey === apiKey);
  if (!device) {
    return res.status(401).json({ error: "Not authorized — invalid or missing device API key" });
  }
  req.device = device;
  next();
}
