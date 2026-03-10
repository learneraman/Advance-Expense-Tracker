import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import expenseRoutes from "./expenseRoutes";
import profileRoutes from "./profileRoutes";
import dashboardRoutes from "./dashboardRoutes";
import exportRoutes from "./exportRoutes";
import budgetRoutes from "./budgetRoutes";
import searchRoutes from "./searchRoutes";

const router = Router();

// Auth routes (public)
router.use("/auth", authRoutes);

// User routes
router.use("/users", userRoutes);

// Profile routes (protected)
router.use("/profile", profileRoutes);

// Dashboard routes (protected)
router.use("/dashboard", dashboardRoutes);

// Category routes (protected)
router.use("/categories", categoryRoutes);

// Expense routes (protected)
router.use("/expenses", expenseRoutes);

// Export routes (protected)
router.use("/export", exportRoutes);

// Budget routes (protected)
router.use("/budget", budgetRoutes);

// Search routes (protected)
router.use("/search", searchRoutes);

export default router;

