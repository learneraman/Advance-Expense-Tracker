import { Parser } from "json2csv";
import prisma from "../lib/prisma";

export interface ExportFilters {
  userId: number;
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  format?: "csv" | "json";
}

export class ExportService {
  /**
   * Export expenses to CSV format
   */
  async exportExpensesToCSV(filters: ExportFilters): Promise<string> {
    const expenses = await this.getExpensesForExport(filters);

    if (expenses.length === 0) {
      throw new Error("No expenses found to export");
    }

    // Transform data for CSV
    const csvData = expenses.map((expense) => ({
      ID: expense.id,
      Amount: Number(expense.amount),
      Description: expense.description || "",
      Date: expense.date.toISOString().split("T")[0],
      Category: expense.category.name,
      Type: expense.category.type,
      Tags: expense.tags || "",
    }));

    const parser = new Parser({
      fields: ["ID", "Amount", "Description", "Date", "Category", "Type", "Tags"],
    });

    return parser.parse(csvData);
  }

  /**
   * Export expenses to JSON format
   */
  async exportExpensesToJSON(filters: ExportFilters): Promise<object> {
    const expenses = await this.getExpensesForExport(filters);

    if (expenses.length === 0) {
      throw new Error("No expenses found to export");
    }

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const incomeExpenses = expenses.filter((e) => e.category.type === "INCOME");
    const expenseExpenses = expenses.filter((e) => e.category.type === "EXPENSE");

    return {
      exportDate: new Date().toISOString(),
      summary: {
        totalRecords: expenses.length,
        totalAmount,
        totalIncome: incomeExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
        totalExpenses: expenseExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
        dateRange: {
          from: filters.startDate?.toISOString().split("T")[0] || "all time",
          to: filters.endDate?.toISOString().split("T")[0] || "present",
        },
      },
      expenses: expenses.map((expense) => ({
        id: expense.id,
        amount: Number(expense.amount),
        description: expense.description,
        date: expense.date.toISOString().split("T")[0],
        category: {
          name: expense.category.name,
          type: expense.category.type,
        },
        tags: expense.tags ? expense.tags.split(",").map((t) => t.trim()) : [],
      })),
    };
  }

  /**
   * Export monthly report to CSV
   */
  async exportMonthlyReportCSV(userId: number, year: number, month: number): Promise<string> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        category: { select: { name: true, type: true } },
      },
      orderBy: { date: "asc" },
    });

    // Group by category
    const categoryTotals = new Map<string, { income: number; expense: number; count: number }>();

    expenses.forEach((e) => {
      const key = e.category.name;
      if (!categoryTotals.has(key)) {
        categoryTotals.set(key, { income: 0, expense: 0, count: 0 });
      }
      const totals = categoryTotals.get(key)!;
      if (e.category.type === "INCOME") {
        totals.income += Number(e.amount);
      } else {
        totals.expense += Number(e.amount);
      }
      totals.count++;
    });

    const csvData = Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      Category: category,
      "Total Income": totals.income,
      "Total Expense": totals.expense,
      "Net Amount": totals.income - totals.expense,
      "Transaction Count": totals.count,
    }));

    const parser = new Parser({
      fields: ["Category", "Total Income", "Total Expense", "Net Amount", "Transaction Count"],
    });

    return parser.parse(csvData);
  }

  /**
   * Get expenses for export with filters
   */
  private async getExpensesForExport(filters: ExportFilters) {
    const where: any = { userId: filters.userId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return prisma.expense.findMany({
      where,
      include: {
        category: { select: { name: true, type: true } },
      },
      orderBy: { date: "desc" },
    });
  }
}
