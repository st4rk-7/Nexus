// backend/routes/authRoutes.js
// Routes for admin authentication (register + login).

import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/authController.js";

const router = express.Router();

// POST /register — create a new admin account
router.post("/register", registerAdmin);

// POST /login — log in and receive a JWT token
router.post("/login", loginAdmin);

export default router;
