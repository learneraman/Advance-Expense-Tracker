import prisma from "../lib/prisma";
import { Expense } from "../models/expense";
import { Prisma } from "@prisma/client";

export interface CreateExpenseData {
  amount: number;
  description?: string;
  date: Date;
  userId: number;
  categoryId: number;
}

export interface UpdateExpenseData {
  amount?: number;
  description?: string;
  date?: Date;
  categoryId?: number;
}

export interface ExpenseFilters {
  userId: number;
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ExpenseWithCategory extends Expense {
  category: {
    id: number;
    name: string;
    type: string;
  };
}

export class ExpenseRepository {
  /**
   * Create a new expense
   */
  async create(data: CreateExpenseData): Promise<ExpenseWithCategory> {
    return prisma.expense.create({
      data: {
        amount: new Prisma.Decimal(data.amount),
        description: data.description,
        date: data.date,
        userId: data.userId,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    }) as unknown as ExpenseWithCategory;
  }

  /**
   * Find expense by ID
   */
  async findById(id: number): Promise<ExpenseWithCategory | null> {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    }) as unknown as ExpenseWithCategory | null;
  }

  /**
   * Find expense by ID and userId (ownership check)
   */
  async findByIdAndUserId(id: number, userId: number): Promise<ExpenseWithCategory | null> {
    return prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    }) as unknown as ExpenseWithCategory | null;
  }

  /**
   * Find all expenses with filters
   */
  async findAll(filters: ExpenseFilters, sortBy: string = "date", sortOrder: "asc" | "desc" = "desc"): Promise<ExpenseWithCategory[]> {
    const where = this.buildWhereClause(filters);

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return prisma.expense.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy,
    }) as unknown as ExpenseWithCategory[];
  }

  /**
   * Find all expenses with filters and pagination
   */
  async findAllPaginated(
    filters: ExpenseFilters,
    pagination: PaginationParams,
    sortBy: string = "date",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginatedResult<ExpenseWithCategory>> {
    const where = this.buildWhereClause(filters);

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (pagination.page - 1) * pagination.limit;

    // Get total count and data in parallel
    const [total, data] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, type: true },
          },
        },
        orderBy,
        skip,
        take: pagination.limit,
      }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data: data as unknown as ExpenseWithCategory[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };
  }

  /**
   * Build WHERE clause for expense queries
   */
  private buildWhereClause(filters: ExpenseFilters): Prisma.ExpenseWhereInput {
    const where: Prisma.ExpenseWhereInput = {
      userId: filters.userId,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) {
        where.amount.gte = new Prisma.Decimal(filters.minAmount);
      }
      if (filters.maxAmount) {
        where.amount.lte = new Prisma.Decimal(filters.maxAmount);
      }
    }

    return where;
  }

  /**
   * Update an expense
   */
  async update(id: number, data: UpdateExpenseData): Promise<ExpenseWithCategory> {
    const updateData: Prisma.ExpenseUpdateInput = {};

    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.date !== undefined) {
      updateData.date = data.date;
    }
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    return prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    }) as unknown as ExpenseWithCategory;
  }

  /**
   * Delete an expense
   */
  async delete(id: number): Promise<Expense> {
    return prisma.expense.delete({ where: { id } }) as unknown as Expense;
  }

  /**
   * Get expense summary by category for a user
   */
  async getSummaryByCategory(userId: number, startDate?: Date, endDate?: Date) {
    const where: Prisma.ExpenseWhereInput = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return prisma.expense.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true },
      _count: { id: true },
    });
  }

  /**
   * Get total expenses for a user
   */
  async getTotal(userId: number, startDate?: Date, endDate?: Date) {
    const where: Prisma.ExpenseWhereInput = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
    });
  }
}
