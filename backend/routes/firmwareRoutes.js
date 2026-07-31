// backend/routes/firmwareRoutes.js
// Routes for firmware management

import express from "express";
import multer from "multer";
import { uploadFirmware, getFirmwareVersions, downloadFirmware } from "../controllers/firmwareController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Keep each upload in memory briefly, then the controller streams it into
// MongoDB GridFS. The size limit protects the server from huge uploads.
const maxFileSizeMb = Number(process.env.MAX_FIRMWARE_SIZE_MB || 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
});

// Routes
// Uploading firmware is admin-only. `protect` runs first (checks the JWT badge),
// then multer reads the file, then the controller stores it in MongoDB.
router.post("/", protect, upload.single("file"), uploadFirmware);

router.get("/", protect, getFirmwareVersions);

// Download a firmware file by ID
router.get("/:id/download", downloadFirmware);

export default router;
