import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/profileController";

const router = Router();

/**
 * Profile Routes (Protected)
 * Base path: /api/profile
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(authenticate);

// GET /api/profile - Get current user profile
router.get("/", getProfile);

// PUT /api/profile - Update profile (name, email)
router.put("/", updateProfile);

// PUT /api/profile/password - Change password
router.put("/password", changePassword);

// DELETE /api/profile - Delete account
router.delete("/", deleteAccount);

export default router;
