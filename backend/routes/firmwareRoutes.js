// backend/routes/firmwareRoutes.js
// Routes for firmware management

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadFirmware, getFirmwareVersions, downloadFirmware } from "../controllers/firmwareController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config: telling it WHERE to save files and WHAT to name them
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir); // save in backend/uploads/
  },
  filename(req, file, cb) {
    // Keep the original name but add a timestamp so we don't overwrite files with the same name
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
// Uploading firmware is admin-only. `protect` runs first (checks the JWT badge),
// then multer saves the file, then the controller stores it.
router.post("/", protect, upload.single("file"), uploadFirmware);

router.get("/", getFirmwareVersions);

// Download a firmware file by ID
router.get("/:id/download", downloadFirmware);

export default router;
