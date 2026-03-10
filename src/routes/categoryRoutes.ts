import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
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

// POST /api/categories - Create new category
router.post("/", createCategory);

// GET /api/categories - Get all categories (optionally filter by type)
router.get("/", getCategories);

// GET /api/categories/:id - Get single category
router.get("/:id", getCategoryById);

// PUT /api/categories/:id - Update category
router.put("/:id", updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", deleteCategory);

export default router;
