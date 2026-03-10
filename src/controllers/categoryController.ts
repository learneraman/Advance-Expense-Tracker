import { Response } from "express";
import { CategoryService } from "../services/categoryService";
import { AuthRequest } from "../middleware/authMiddleware";
import { CategoryType } from "../models/category";

const categoryService = new CategoryService();

/**
 * Create a new category
 * POST /api/categories
 */
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, type } = req.body;

    if (!name || !type) {
      res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
      return;
    }

    const category = await categoryService.createCategory({ name, type }, userId);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

/**
 * Get all categories for user
 * GET /api/categories
 * Query: ?type=INCOME|EXPENSE (optional)
 */
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { type } = req.query;

    let categories;
    if (type && (type === "INCOME" || type === "EXPENSE")) {
      categories = await categoryService.getCategoriesByType(type as CategoryType, userId);
    } else {
      categories = await categoryService.getAllCategories(userId);
    }

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const category = await categoryService.getCategoryById(id, userId);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch category",
    });
  }
};

/**
 * Update a category
 * PUT /api/categories/:id
 */
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string);
    const { name, type } = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    if (!name && !type) {
      res.status(400).json({
        success: false,
        message: "At least one field (name or type) is required",
      });
      return;
    }

    const category = await categoryService.updateCategory(id, { name, type }, userId);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("already exists") ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    await categoryService.deleteCategory(id, userId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};
