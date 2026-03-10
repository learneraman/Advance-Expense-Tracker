import { Router } from "express";
import { registerUser } from "../controllers/userController";

const router = Router();

// Simple example route to show Service-Repository pattern in action
router.post("/register", registerUser);

export default router;

