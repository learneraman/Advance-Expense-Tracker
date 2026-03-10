import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Profile Schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
}).refine(data => data.name || data.email, {
  message: "At least one field (name or email) is required",
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
});

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Type must be INCOME or EXPENSE",
  }),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
}).refine(data => data.name || data.type, {
  message: "At least one field (name or type) is required",
});

// Expense Schemas
export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  categoryId: z.number().int().positive("Invalid category ID"),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").optional(),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  categoryId: z.number().int().positive("Invalid category ID").optional(),
}).refine(data => data.amount || data.description !== undefined || data.date || data.categoryId, {
  message: "At least one field is required",
});

// Query Schemas
export const expenseQuerySchema = z.object({
  categoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }).optional(),
  minAmount: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxAmount: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  sortBy: z.enum(["date", "amount", "categoryId"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
