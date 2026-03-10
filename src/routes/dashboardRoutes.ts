import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getDashboardStats,
  getMonthlyReport,
  getYearlyReport,
} from "../controllers/dashboardController";

const router = Router();

/**
 * Dashboard Routes (Protected)
 * Base path: /api/dashboard
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(authenticate);

// GET /api/dashboard - Get dashboard statistics
router.get("/", getDashboardStats);

// GET /api/dashboard/report/monthly - Get monthly report
router.get("/report/monthly", getMonthlyReport);

// GET /api/dashboard/report/yearly - Get yearly report
router.get("/report/yearly", getYearlyReport);

export default router;
