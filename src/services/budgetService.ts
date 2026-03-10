import prisma from "../lib/prisma";
import { CategoryRepository } from "../repositories/categoryRepository";
import { Prisma } from "@prisma/client";

export interface BudgetStatus {
  categoryId: number;
  categoryName: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "under" | "warning" | "over";
}

export interface SetBudgetPayload {
  categoryId: number;
  budget: number;
}

export class BudgetService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Set budget for a category
   */
  async setBudget(userId: number, payload: SetBudgetPayload): Promise<any> {
    const { categoryId, budget } = payload;

    // Verify category belongs to user
    const category = await this.categoryRepository.findByIdAndUserId(categoryId, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== "EXPENSE") {
      throw new Error("Budget can only be set for EXPENSE type categories");
    }

    if (budget < 0) {
      throw new Error("Budget must be a positive number");
    }

    // Update category with budget
    return prisma.category.update({
      where: { id: categoryId },
      data: { budget: new Prisma.Decimal(budget) },
    });
  }

  /**
   * Remove budget from a category
   */
  async removeBudget(userId: number, categoryId: number): Promise<any> {
    const category = await this.categoryRepository.findByIdAndUserId(categoryId, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: { budget: null },
    });
  }

  /**
   * Get budget status for all categories (current month)
   */
  async getBudgetStatus(userId: number): Promise<BudgetStatus[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all expense categories with budgets
    const categories = await prisma.category.findMany({
      where: {
        userId,
        type: "EXPENSE",
        budget: { not: null },
      },
    });

    // Get spending per category for current month
    const spending = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        categoryId: { in: categories.map((c) => c.id) },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const spendingMap = new Map(spending.map((s) => [s.categoryId, Number(s._sum.amount) || 0]));

    return categories.map((category) => {
      const budget = Number(category.budget);
      const spent = spendingMap.get(category.id) || 0;
      const remaining = budget - spent;
      const percentage = Math.round((spent / budget) * 100);

      let status: "under" | "warning" | "over" = "under";
      if (percentage >= 100) {
        status = "over";
      } else if (percentage >= 80) {
        status = "warning";
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        budget,
        spent,
        remaining,
        percentage,
        status,
      };
    });
  }

  /**
   * Get budget alerts (categories at or over budget)
   */
  async getBudgetAlerts(userId: number): Promise<BudgetStatus[]> {
    const allStatus = await this.getBudgetStatus(userId);
    return allStatus.filter((s) => s.status === "warning" || s.status === "over");
  }

  /**
   * Check if adding expense would exceed budget
   */
  async checkBudgetBeforeExpense(
    userId: number,
    categoryId: number,
    amount: number
  ): Promise<{ wouldExceed: boolean; currentSpent: number; budget: number | null; newTotal: number }> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.budget) {
      return { wouldExceed: false, currentSpent: 0, budget: null, newTotal: amount };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const spending = await prisma.expense.aggregate({
      where: {
        userId,
        categoryId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const currentSpent = Number(spending._sum.amount) || 0;
    const budget = Number(category.budget);
    const newTotal = currentSpent + amount;

    return {
      wouldExceed: newTotal > budget,
      currentSpent,
      budget,
      newTotal,
    };
  }
}
