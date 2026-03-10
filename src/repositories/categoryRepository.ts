import prisma from "../lib/prisma";
import { Category, CategoryType } from "../models/category";

export interface CreateCategoryData {
  name: string;
  type: CategoryType;
  userId: number;
}

export interface UpdateCategoryData {
  name?: string;
  type?: CategoryType;
}

export class CategoryRepository {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryData): Promise<Category> {
    return prisma.category.create({ data }) as unknown as Category;
  }

  /**
   * Find category by ID
   */
  async findById(id: number): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } }) as unknown as Category | null;
  }

  /**
   * Find category by ID and userId (ownership check)
   */
  async findByIdAndUserId(id: number, userId: number): Promise<Category | null> {
    return prisma.category.findFirst({
      where: { id, userId },
    }) as unknown as Category | null;
  }

  /**
   * Find all categories for a user
   */
  async findAllByUserId(userId: number): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }) as unknown as Category[];
  }

  /**
   * Find categories by type for a user
   */
  async findByTypeAndUserId(type: CategoryType, userId: number): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId, type },
      orderBy: { name: "asc" },
    }) as unknown as Category[];
  }

  /**
   * Update a category
   */
  async update(id: number, data: UpdateCategoryData): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    }) as unknown as Category;
  }

  /**
   * Delete a category
   */
  async delete(id: number): Promise<Category> {
    return prisma.category.delete({ where: { id } }) as unknown as Category;
  }

  /**
   * Check if category name exists for user
   */
  async existsByNameAndUserId(name: string, userId: number, excludeId?: number): Promise<boolean> {
    const category = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        userId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!category;
  }
}
