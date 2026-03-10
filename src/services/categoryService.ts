import { CategoryRepository, CreateCategoryData, UpdateCategoryData } from "../repositories/categoryRepository";
import { Category, CategoryType } from "../models/category";

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryPayload {
  name?: string;
  type?: CategoryType;
}

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository = new CategoryRepository()) {
    this.categoryRepository = categoryRepository;
  }

  /**
   * Create a new category for user
   */
  async createCategory(payload: CreateCategoryPayload, userId: number): Promise<Category> {
    const { name, type } = payload;

    // Validate type
    if (!["INCOME", "EXPENSE"].includes(type)) {
      throw new Error("Type must be INCOME or EXPENSE");
    }

    // Check if category name already exists for user
    const exists = await this.categoryRepository.existsByNameAndUserId(name, userId);
    if (exists) {
      throw new Error("Category with this name already exists");
    }

    return this.categoryRepository.create({ name, type, userId });
  }

  /**
   * Get all categories for user
   */
  async getAllCategories(userId: number): Promise<Category[]> {
    return this.categoryRepository.findAllByUserId(userId);
  }

  /**
   * Get categories by type for user
   */
  async getCategoriesByType(type: CategoryType, userId: number): Promise<Category[]> {
    if (!["INCOME", "EXPENSE"].includes(type)) {
      throw new Error("Type must be INCOME or EXPENSE");
    }
    return this.categoryRepository.findByTypeAndUserId(type, userId);
  }

  /**
   * Get single category by ID (with ownership check)
   */
  async getCategoryById(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findByIdAndUserId(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  /**
   * Update a category
   */
  async updateCategory(id: number, payload: UpdateCategoryPayload, userId: number): Promise<Category> {
    // Check ownership
    const category = await this.categoryRepository.findByIdAndUserId(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Validate type if provided
    if (payload.type && !["INCOME", "EXPENSE"].includes(payload.type)) {
      throw new Error("Type must be INCOME or EXPENSE");
    }

    // Check for duplicate name if name is being updated
    if (payload.name && payload.name !== category.name) {
      const exists = await this.categoryRepository.existsByNameAndUserId(payload.name, userId, id);
      if (exists) {
        throw new Error("Category with this name already exists");
      }
    }

    return this.categoryRepository.update(id, payload);
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: number, userId: number): Promise<Category> {
    // Check ownership
    const category = await this.categoryRepository.findByIdAndUserId(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    return this.categoryRepository.delete(id);
  }
}
