import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getDashboardStats,
  getMonthlyReport,
  getYearlyReport,
} from "../controllers/dashboardController";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics for current user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getDashboardStats);

/**
 * @swagger
 * /api/dashboard/report/monthly:
 *   get:
 *     summary: Get monthly financial report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year of report (e.g. 2026)
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Month of report (1-12)
 *     responses:
 *       200:
 *         description: Monthly report retrieved successfully
 *       400:
 *         description: Year and month are required
 *       401:
 *         description: Unauthorized
 */
router.get("/report/monthly", getMonthlyReport);

/**
 * @swagger
 * /api/dashboard/report/yearly:
 *   get:
 *     summary: Get yearly financial report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year of report (e.g. 2026)
 *     responses:
 *       200:
 *         description: Yearly report retrieved successfully
 *       400:
 *         description: Year is required
 *       401:
 *         description: Unauthorized
 */
router.get("/report/yearly", getYearlyReport);

export default router;
