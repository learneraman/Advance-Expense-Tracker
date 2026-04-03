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

/**
 * Expense Routes (Protected)
 * Base path: /api/expenses
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(authenticate);

// GET /api/expenses/summary - Get expense summary (must be before :id route)
// Viewers, Analysts, and Admins can view
router.get("/summary", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getExpenseSummary);

// GET /api/expenses - Get all expenses with filters
router.get("/", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getExpenses);

// GET /api/expenses/:id - Get single expense
router.get("/:id", authorizeRoles(["VIEWER", "ANALYST", "ADMIN"]), getExpenseById);

// POST /api/expenses - Create new expense (ADMIN ONLY)
router.post("/", authorizeRoles(["ADMIN"]), createExpense);

// PUT /api/expenses/:id - Update expense (ADMIN ONLY)
router.put("/:id", authorizeRoles(["ADMIN"]), updateExpense);

// DELETE /api/expenses/:id - Delete expense (ADMIN ONLY)
router.delete("/:id", authorizeRoles(["ADMIN"]), deleteExpense);

export default router;
