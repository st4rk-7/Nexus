// backend/routes/firmwareRoutes.js
// Routes for firmware management

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadFirmware, getFirmwareVersions } from "../controllers/firmwareController.js";

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
// We insert `upload.single("file")` as middleware. 
// It looks for a field named "file" in the incoming form data, saves it, and attaches info to `req.file`.
router.post("/", upload.single("file"), uploadFirmware);

router.get("/", getFirmwareVersions);

export default router;
