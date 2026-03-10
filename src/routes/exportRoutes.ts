import { Router } from "express";
import { exportExpensesCSV, exportExpensesJSON, exportMonthlyReportCSV } from "../controllers/exportController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/export/expenses/csv:
 *   get:
 *     summary: Export expenses to CSV file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (YYYY-MM-DD)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/expenses/csv", exportExpensesCSV);

/**
 * @swagger
 * /api/export/expenses/json:
 *   get:
 *     summary: Export expenses to JSON file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
router.get("/expenses/json", exportExpensesJSON);

/**
 * @swagger
 * /api/export/report/monthly:
 *   get:
 *     summary: Export monthly report to CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2024)
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Month (1-12)
 */
router.get("/report/monthly", exportMonthlyReportCSV);

export default router;
