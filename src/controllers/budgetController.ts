import { Request, Response } from "express";
import { BudgetService, SetBudgetPayload } from "../services/budgetService";

const budgetService = new BudgetService();

/**
 * @swagger
 * /api/budget:
 *   post:
 *     summary: Set budget for a category
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 */
export const setBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { categoryId, budget } = req.body;

    if (!categoryId || budget === undefined) {
      res.status(400).json({ success: false, message: "categoryId and budget are required" });
      return;
    }

    const payload: SetBudgetPayload = {
      categoryId: parseInt(categoryId),
      budget: parseFloat(budget),
    };

    const category = await budgetService.setBudget(userId, payload);
    res.status(200).json({
      success: true,
      message: "Budget set successfully",
      data: {
        categoryId: category.id,
        categoryName: category.name,
        budget: Number(category.budget),
      },
    });
  } catch (error: any) {
    if (error.message === "Category not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message.includes("EXPENSE type") || error.message.includes("positive number")) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error("Set budget error:", error);
    res.status(500).json({ success: false, message: "Error setting budget" });
  }
};

/**
 * @swagger
 * /api/budget/{categoryId}:
 *   delete:
 *     summary: Remove budget from a category
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 */
export const removeBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const categoryId = parseInt(req.params.categoryId as string);

    await budgetService.removeBudget(userId, categoryId);
    res.status(200).json({ success: true, message: "Budget removed successfully" });
  } catch (error: any) {
    if (error.message === "Category not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    console.error("Remove budget error:", error);
    res.status(500).json({ success: false, message: "Error removing budget" });
  }
};

/**
 * @swagger
 * /api/budget/status:
 *   get:
 *     summary: Get budget status for all categories
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 */
export const getBudgetStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const status = await budgetService.getBudgetStatus(userId);
    res.status(200).json({ success: true, data: status });
  } catch (error: any) {
    console.error("Get budget status error:", error);
    res.status(500).json({ success: false, message: "Error fetching budget status" });
  }
};

/**
 * @swagger
 * /api/budget/alerts:
 *   get:
 *     summary: Get budget alerts (categories at or over budget)
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 */
export const getBudgetAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const alerts = await budgetService.getBudgetAlerts(userId);
    res.status(200).json({
      success: true,
      data: alerts,
      message: alerts.length > 0 ? `${alerts.length} categories need attention` : "All budgets are on track",
    });
  } catch (error: any) {
    console.error("Get budget alerts error:", error);
    res.status(500).json({ success: false, message: "Error fetching budget alerts" });
  }
};

/**
 * @swagger
 * /api/budget/check:
 *   post:
 *     summary: Check if expense would exceed budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 */
export const checkBudgetBeforeExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { categoryId, amount } = req.body;

    if (!categoryId || !amount) {
      res.status(400).json({ success: false, message: "categoryId and amount are required" });
      return;
    }

    const result = await budgetService.checkBudgetBeforeExpense(
      userId,
      parseInt(categoryId),
      parseFloat(amount)
    );

    res.status(200).json({
      success: true,
      data: result,
      warning: result.wouldExceed ? "This expense would exceed your budget!" : null,
    });
  } catch (error: any) {
    console.error("Check budget error:", error);
    res.status(500).json({ success: false, message: "Error checking budget" });
  }
};
