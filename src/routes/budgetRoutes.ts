import { Router } from "express";
import {
  setBudget,
  removeBudget,
  getBudgetStatus,
  getBudgetAlerts,
  checkBudgetBeforeExpense,
} from "../controllers/budgetController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/budget:
 *   post:
 *     summary: Set budget for a category
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - budget
 *             properties:
 *               categoryId:
 *                 type: integer
 *               budget:
 *                 type: number
 *                 description: Monthly budget amount (only for EXPENSE categories)
 *     responses:
 *       200:
 *         description: Budget set successfully
 */
router.post("/", setBudget);

/**
 * @swagger
 * /api/budget/status:
 *   get:
 *     summary: Get budget status for all categories (current month)
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget status for all categories with budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: integer
 *                       categoryName:
 *                         type: string
 *                       budget:
 *                         type: number
 *                       spent:
 *                         type: number
 *                       remaining:
 *                         type: number
 *                       percentage:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [under, warning, over]
 */
router.get("/status", getBudgetStatus);

/**
 * @swagger
 * /api/budget/alerts:
 *   get:
 *     summary: Get budget alerts (categories at 80%+ budget)
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 */
router.get("/alerts", getBudgetAlerts);

/**
 * @swagger
 * /api/budget/check:
 *   post:
 *     summary: Check if expense would exceed budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - amount
 *             properties:
 *               categoryId:
 *                 type: integer
 *               amount:
 *                 type: number
 */
router.post("/check", checkBudgetBeforeExpense);

/**
 * @swagger
 * /api/budget/{categoryId}:
 *   delete:
 *     summary: Remove budget from a category
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/:categoryId", removeBudget);

export default router;
