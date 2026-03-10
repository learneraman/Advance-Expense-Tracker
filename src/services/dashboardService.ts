import { ExpenseRepository } from "../repositories/expenseRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
import prisma from "../lib/prisma";

export interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  expenseCount: number;
  categoryCount: number;
  recentExpenses: Array<{
    id: number;
    amount: number;
    description: string | null;
    date: Date;
    category: { name: string; type: string };
  }>;
  topCategories: Array<{
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    totalExpense: number;
    totalIncome: number;
  }>;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    categoryType: string;
    totalAmount: number;
    count: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    totalExpense: number;
    totalIncome: number;
  }>;
}

export class DashboardService {
  private expenseRepository: ExpenseRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.expenseRepository = new ExpenseRepository();
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Get dashboard statistics for user
   */
  async getDashboardStats(userId: number): Promise<DashboardStats> {
    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all categories for user
    const categories = await this.categoryRepository.findAllByUserId(userId);
    const incomeCategories = categories.filter((c) => c.type === "INCOME").map((c) => c.id);
    const expenseCategories = categories.filter((c) => c.type === "EXPENSE").map((c) => c.id);

    // Get expenses grouped by category type for current month
    const [expenseTotal, incomeTotal, recentExpenses, categoryExpenses] = await Promise.all([
      // Total expenses (EXPENSE type categories)
      prisma.expense.aggregate({
        where: {
          userId,
          categoryId: { in: expenseCategories },
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Total income (INCOME type categories)
      prisma.expense.aggregate({
        where: {
          userId,
          categoryId: { in: incomeCategories },
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      // Recent 5 expenses
      prisma.expense.findMany({
        where: { userId },
        include: {
          category: { select: { name: true, type: true } },
        },
        orderBy: { date: "desc" },
        take: 5,
      }),
      // Expenses by category (for top categories)
      prisma.expense.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          categoryId: { in: expenseCategories },
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
    ]);

    const totalExpenses = Number(expenseTotal._sum.amount) || 0;
    const totalIncome = Number(incomeTotal._sum.amount) || 0;

    // Build top categories with percentage
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const topCategories = categoryExpenses.map((item) => {
      const category = categoryMap.get(item.categoryId);
      const amount = Number(item._sum.amount) || 0;
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || "Unknown",
        totalAmount: amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      };
    });

    // Get monthly trend (last 6 months)
    const monthlyTrend = await this.getMonthlyTrend(userId, 6);

    return {
      totalExpenses,
      totalIncome,
      netBalance: totalIncome - totalExpenses,
      expenseCount: expenseTotal._count.id,
      categoryCount: categories.length,
      recentExpenses: recentExpenses.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        description: e.description,
        date: e.date,
        category: e.category,
      })),
      topCategories,
      monthlyTrend,
    };
  }

  /**
   * Get monthly report for a specific month
   */
  async getMonthlyReport(userId: number, year: number, month: number): Promise<MonthlyReport> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const monthName = startOfMonth.toLocaleString("default", { month: "long" });

    const categories = await this.categoryRepository.findAllByUserId(userId);
    const incomeCategories = categories.filter((c) => c.type === "INCOME").map((c) => c.id);
    const expenseCategories = categories.filter((c) => c.type === "EXPENSE").map((c) => c.id);

    // Get totals
    const [expenseTotal, incomeTotal, byCategory] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId,
          categoryId: { in: expenseCategories },
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          categoryId: { in: incomeCategories },
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // Get daily breakdown
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        category: { select: { type: true } },
      },
    });

    // Build daily breakdown
    const dailyMap = new Map<string, { expense: number; income: number }>();
    expenses.forEach((e) => {
      const dateKey = e.date.toISOString().split("T")[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { expense: 0, income: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      if (e.category.type === "EXPENSE") {
        day.expense += Number(e.amount);
      } else {
        day.income += Number(e.amount);
      }
    });

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        totalExpense: data.expense,
        totalIncome: data.income,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Build category breakdown
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
      month: monthName,
      year,
      totalExpenses: Number(expenseTotal._sum.amount) || 0,
      totalIncome: Number(incomeTotal._sum.amount) || 0,
      netBalance: (Number(incomeTotal._sum.amount) || 0) - (Number(expenseTotal._sum.amount) || 0),
      byCategory: categorySummary,
      dailyBreakdown,
    };
  }

  /**
   * Get yearly report
   */
  async getYearlyReport(userId: number, year: number) {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const report = await this.getMonthlyReport(userId, year, month);
      months.push({
        month: report.month,
        totalExpenses: report.totalExpenses,
        totalIncome: report.totalIncome,
        netBalance: report.netBalance,
      });
    }

    const totalExpenses = months.reduce((sum, m) => sum + m.totalExpenses, 0);
    const totalIncome = months.reduce((sum, m) => sum + m.totalIncome, 0);

    return {
      year,
      totalExpenses,
      totalIncome,
      netBalance: totalIncome - totalExpenses,
      monthlyBreakdown: months,
    };
  }

  /**
   * Get monthly trend for last N months
   */
  private async getMonthlyTrend(userId: number, months: number) {
    const trends = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString("default", { month: "short" });

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      const categories = await this.categoryRepository.findAllByUserId(userId);
      const incomeCategories = categories.filter((c) => c.type === "INCOME").map((c) => c.id);
      const expenseCategories = categories.filter((c) => c.type === "EXPENSE").map((c) => c.id);

      const [expense, income] = await Promise.all([
        prisma.expense.aggregate({
          where: {
            userId,
            categoryId: { in: expenseCategories },
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            userId,
            categoryId: { in: incomeCategories },
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

      trends.push({
        month: `${monthName} ${year}`,
        totalExpense: Number(expense._sum.amount) || 0,
        totalIncome: Number(income._sum.amount) || 0,
      });
    }

    return trends.reverse();
  }
}
