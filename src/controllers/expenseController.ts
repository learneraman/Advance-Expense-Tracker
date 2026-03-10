import { Response } from "express";
import { ExpenseService } from "../services/expenseService";
import { AuthRequest } from "../middleware/authMiddleware";

const expenseService = new ExpenseService();

/**
 * Create a new expense
 * POST /api/expenses
 */
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amount, description, date, categoryId } = req.body;

    if (!amount || !date || !categoryId) {
      res.status(400).json({
        success: false,
        message: "Amount, date, and categoryId are required",
      });
      return;
    }

    const expense = await expenseService.createExpense(
      { amount: parseFloat(amount), description, date, categoryId: parseInt(categoryId) },
      userId
    );

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create expense",
    });
  }
};

/**
 * Get all expenses for user
 * GET /api/expenses
 * Query params: categoryId, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, page, limit
 */
export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const queryParams = {
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    // If page or limit is provided, use paginated response
    if (queryParams.page || queryParams.limit) {
      const result = await expenseService.getAllExpensesPaginated(userId, queryParams);
      res.status(200).json({
        success: true,
        ...result,
      });
      return;
    }

    // Otherwise return all expenses (backward compatible)
    const expenses = await expenseService.getAllExpenses(userId, queryParams);
    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expenses",
    });
  }
};

/**
 * Get single expense by ID
 * GET /api/expenses/:id
 */
export const getExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
      return;
    }

    const expense = await expenseService.getExpenseById(id, userId);

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch expense",
    });
  }
};

/**
 * Update an expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string);
    const { amount, description, date, categoryId } = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
      return;
    }

    if (!amount && !description && !date && !categoryId) {
      res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
      return;
    }

    const expense = await expenseService.updateExpense(
      id,
      {
        amount: amount ? parseFloat(amount) : undefined,
        description,
        date,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      },
      userId
    );

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update expense",
    });
  }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
      return;
    }

    await expenseService.deleteExpense(id, userId);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete expense",
    });
  }
};

/**
 * Get expense summary
 * GET /api/expenses/summary
 * Query params: startDate, endDate
 */
export const getExpenseSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const summary = await expenseService.getExpenseSummary(
      userId,
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expense summary",
    });
  }
};
