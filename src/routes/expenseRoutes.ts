import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expenseController";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/expenses/summary:
 *   get:
 *     summary: Get summary of expenses grouped by category
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getExpenseSummary);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses with filtering and pagination
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to end date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Order of sorting
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Records per page for pagination
 *     responses:
 *       200:
 *         description: List of expenses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get a single expense record by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The expense ID
 *     responses:
 *       200:
 *         description: Expense details retrieved successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
router.get("/:id", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getExpenseById);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense (ADMIN ONLY)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - date
 *               - categoryId
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Invalid input details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires ADMIN role)
 *       404:
 *         description: Category not found
 */
router.post("/", authorizeRoles(["ADMIN"]), createExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense record (ADMIN ONLY)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Invalid input details or ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires ADMIN role)
 *       404:
 *         description: Expense or category not found
 */
router.put("/:id", authorizeRoles(["ADMIN"]), updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense record (ADMIN ONLY)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires ADMIN role)
 *       404:
 *         description: Expense not found
 */
router.delete("/:id", authorizeRoles(["ADMIN"]), deleteExpense);

export default router;
