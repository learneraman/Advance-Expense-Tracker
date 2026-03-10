import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

/**
 * Auth Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Register new user
router.post("/register", register);

// POST /api/auth/login - Login user
router.post("/login", login);

export default router;
