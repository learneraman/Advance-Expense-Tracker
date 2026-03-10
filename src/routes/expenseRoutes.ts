import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expenseController";

const router = Router();

/**
 * Expense Routes (Protected)
 * Base path: /api/expenses
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(authenticate);

// GET /api/expenses/summary - Get expense summary (must be before :id route)
router.get("/summary", getExpenseSummary);

// POST /api/expenses - Create new expense
router.post("/", createExpense);

// GET /api/expenses - Get all expenses with filters
router.get("/", getExpenses);

// GET /api/expenses/:id - Get single expense
router.get("/:id", getExpenseById);

// PUT /api/expenses/:id - Update expense
router.put("/:id", updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete("/:id", deleteExpense);

export default router;
