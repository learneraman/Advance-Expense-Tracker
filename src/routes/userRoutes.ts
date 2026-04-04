import { Router } from "express";
import { registerUser, getAllUsers, updateRole, updateStatus } from "../controllers/userController";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Public route
router.post("/register", registerUser);

// Admin only routes for User & Role Management
router.get("/", authenticate, authorizeRoles(["ADMIN"]), getAllUsers);
router.put("/:id/role", authenticate, authorizeRoles(["ADMIN"]), updateRole);
router.put("/:id/status", authenticate, authorizeRoles(["ADMIN"]), updateStatus);

export default router;
