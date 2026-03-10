import { ExpenseRepository, ExpenseFilters, ExpenseWithCategory, PaginatedResult } from "../repositories/expenseRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
import { Expense } from "../models/expense";

export interface CreateExpensePayload {
  amount: number;
  description?: string;
  date: string | Date;
  categoryId: number;
}

export interface UpdateExpensePayload {
  amount?: number;
  description?: string;
  date?: string | Date;
  categoryId?: number;
}

export interface ExpenseQueryParams {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    categoryType: string;
    totalAmount: number;
    count: number;
  }>;
}

export class ExpenseService {
  private expenseRepository: ExpenseRepository;
  private categoryRepository: CategoryRepository;

  constructor(
    expenseRepository = new ExpenseRepository(),
    categoryRepository = new CategoryRepository()
  ) {
    this.expenseRepository = expenseRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Create a new expense
   */
  async createExpense(payload: CreateExpensePayload, userId: number): Promise<ExpenseWithCategory> {
    const { amount, description, date, categoryId } = payload;

    // Validate amount
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Verify category exists and belongs to user
    const category = await this.categoryRepository.findByIdAndUserId(categoryId, userId);
    if (!category) {
      throw new Error("Category not found or doesn't belong to you");
    }

    // Parse date
    const expenseDate = new Date(date);
    if (isNaN(expenseDate.getTime())) {
      throw new Error("Invalid date format");
    }

    return this.expenseRepository.create({
      amount,
      description,
      date: expenseDate,
      userId,
      categoryId,
    });
  }

  /**
   * Get all expenses for user with filters
   */
  async getAllExpenses(userId: number, queryParams: ExpenseQueryParams): Promise<ExpenseWithCategory[]> {
    const filters = await this.buildFilters(userId, queryParams);
    const { sortBy, sortOrder } = this.getSortParams(queryParams);
    return this.expenseRepository.findAll(filters, sortBy, sortOrder);
  }

  /**
   * Get all expenses for user with filters and pagination
   */
  async getAllExpensesPaginated(userId: number, queryParams: ExpenseQueryParams): Promise<PaginatedResult<ExpenseWithCategory>> {
    const filters = await this.buildFilters(userId, queryParams);
    const { sortBy, sortOrder } = this.getSortParams(queryParams);
    
    const page = queryParams.page || 1;
    const limit = Math.min(queryParams.limit || 10, 100); // max 100 per page

    return this.expenseRepository.findAllPaginated(filters, { page, limit }, sortBy, sortOrder);
  }

  /**
   * Build filters from query params
   */
  private async buildFilters(userId: number, queryParams: ExpenseQueryParams): Promise<ExpenseFilters> {
    const filters: ExpenseFilters = { userId };

    if (queryParams.categoryId) {
      const category = await this.categoryRepository.findByIdAndUserId(queryParams.categoryId, userId);
      if (!category) {
        throw new Error("Category not found");
      }
      filters.categoryId = queryParams.categoryId;
    }

    if (queryParams.startDate) {
      filters.startDate = new Date(queryParams.startDate);
    }

    if (queryParams.endDate) {
      filters.endDate = new Date(queryParams.endDate);
    }

    if (queryParams.minAmount) {
      filters.minAmount = queryParams.minAmount;
    }

    if (queryParams.maxAmount) {
      filters.maxAmount = queryParams.maxAmount;
    }

    return filters;
  }

  /**
   * Get sort parameters
   */
  private getSortParams(queryParams: ExpenseQueryParams): { sortBy: string; sortOrder: "asc" | "desc" } {
    const validSortFields = ["date", "amount", "categoryId"];
    const sortBy = validSortFields.includes(queryParams.sortBy || "") ? queryParams.sortBy! : "date";
    const sortOrder = queryParams.sortOrder === "asc" ? "asc" : "desc";
    return { sortBy, sortOrder };
  }

  /**
   * Get single expense by ID
   */
  async getExpenseById(id: number, userId: number): Promise<ExpenseWithCategory> {
    const expense = await this.expenseRepository.findByIdAndUserId(id, userId);
    if (!expense) {
      throw new Error("Expense not found");
    }
    return expense;
  }

  /**
   * Update an expense
   */
  async updateExpense(id: number, payload: UpdateExpensePayload, userId: number): Promise<ExpenseWithCategory> {
    // Check ownership
    const expense = await this.expenseRepository.findByIdAndUserId(id, userId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Validate amount if provided
    if (payload.amount !== undefined && payload.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Verify new category if provided
    if (payload.categoryId) {
      const category = await this.categoryRepository.findByIdAndUserId(payload.categoryId, userId);
      if (!category) {
        throw new Error("Category not found or doesn't belong to you");
      }
    }

    // Parse date if provided
    let date: Date | undefined;
    if (payload.date) {
      date = new Date(payload.date);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
    }

    return this.expenseRepository.update(id, {
      amount: payload.amount,
      description: payload.description,
      date,
      categoryId: payload.categoryId,
    });
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: number, userId: number): Promise<Expense> {
    // Check ownership
    const expense = await this.expenseRepository.findByIdAndUserId(id, userId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    return this.expenseRepository.delete(id);
  }

  /**
   * Get expense summary for user
   */
  async getExpenseSummary(userId: number, startDate?: string, endDate?: string): Promise<ExpenseSummary> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Get total
    const total = await this.expenseRepository.getTotal(userId, start, end);

    // Get by category
    const byCategory = await this.expenseRepository.getSummaryByCategory(userId, start, end);

    // Get category details
    const categories = await this.categoryRepository.findAllByUserId(userId);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const categorySummary = byCategory.map((item) => {
      const category = categoryMap.get(item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || "Unknown",
        categoryType: category?.type || "EXPENSE",
        totalAmount: Number(item._sum.amount) || 0,
        count: item._count.id,
      };
    });

    return {
      totalAmount: Number(total._sum.amount) || 0,
      totalCount: total._count.id,
      byCategory: categorySummary,
    };
  }
}
