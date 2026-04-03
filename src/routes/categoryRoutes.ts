import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const router = Router();

/**
 * Category Routes (Protected)
 * Base path: /api/categories
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(authenticate);

// GET /api/categories - Get all categories
router.get("/", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getCategories);

// GET /api/categories/:id - Get single category
router.get("/:id", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getCategoryById);

// POST /api/categories - Create new category (ADMIN ONLY)
router.post("/", authorizeRoles(["ADMIN"]), createCategory);

// PUT /api/categories/:id - Update category (ADMIN ONLY)
router.put("/:id", authorizeRoles(["ADMIN"]), updateCategory);

// DELETE /api/categories/:id - Delete category (ADMIN ONLY)
router.delete("/:id", authorizeRoles(["ADMIN"]), deleteCategory);

export default router;
