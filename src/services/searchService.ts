import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export interface SearchParams {
  userId: number;
  query: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  categoryId?: number;
  limit?: number;
}

export interface SearchResult {
  expenses: Array<{
    id: number;
    amount: number;
    description: string | null;
    date: Date;
    tags: string | null;
    category: { id: number; name: string; type: string };
  }>;
  total: number;
  query: string;
}

export class SearchService {
  /**
   * Search expenses by description, tags, or category name
   */
  async searchExpenses(params: SearchParams): Promise<SearchResult> {
    const { userId, query, startDate, endDate, minAmount, maxAmount, categoryId, limit = 50 } = params;

    // Build where clause
    const where: Prisma.ExpenseWhereInput = {
      userId,
      OR: [
        { description: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    };

    // Add additional filters
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = new Prisma.Decimal(minAmount);
      if (maxAmount) where.amount.lte = new Prisma.Decimal(maxAmount);
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get count and results
    const [total, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, type: true } },
        },
        orderBy: { date: "desc" },
        take: limit,
      }),
    ]);

    return {
      expenses: expenses.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        description: e.description,
        date: e.date,
        tags: e.tags,
        category: e.category,
      })),
      total,
      query,
    };
  }

  /**
   * Get search suggestions based on existing data
   */
  async getSearchSuggestions(userId: number, query: string): Promise<string[]> {
    const suggestions = new Set<string>();

    // Get matching category names
    const categories = await prisma.category.findMany({
      where: {
        userId,
        name: { contains: query, mode: "insensitive" },
      },
      select: { name: true },
      take: 5,
    });
    categories.forEach((c) => suggestions.add(c.name));

    // Get unique tags that match
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        tags: { contains: query, mode: "insensitive" },
      },
      select: { tags: true },
      take: 20,
    });

    expenses.forEach((e) => {
      if (e.tags) {
        e.tags.split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(trimmed);
          }
        });
      }
    });

    // Get matching descriptions (first 3 words)
    const descriptions = await prisma.expense.findMany({
      where: {
        userId,
        description: { contains: query, mode: "insensitive" },
      },
      select: { description: true },
      take: 10,
    });

    descriptions.forEach((e) => {
      if (e.description) {
        suggestions.add(e.description.slice(0, 30) + (e.description.length > 30 ? "..." : ""));
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }
}
