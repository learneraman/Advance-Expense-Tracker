import { Request, Response } from "express";
import { ExportService, ExportFilters } from "../services/exportService";

const exportService = new ExportService();

/**
 * @swagger
 * /api/export/expenses/csv:
 *   get:
 *     summary: Export expenses to CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
export const exportExpensesCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate, categoryId } = req.query;

    const filters: ExportFilters = { userId };

    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (categoryId) filters.categoryId = parseInt(categoryId as string);

    const csv = await exportService.exportExpensesToCSV(filters);

    // Set headers for file download
    const filename = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error: any) {
    if (error.message === "No expenses found to export") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    console.error("Export CSV error:", error);
    res.status(500).json({ success: false, message: "Error exporting expenses" });
  }
};

/**
 * @swagger
 * /api/export/expenses/json:
 *   get:
 *     summary: Export expenses to JSON
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
export const exportExpensesJSON = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate, categoryId } = req.query;

    const filters: ExportFilters = { userId };

    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (categoryId) filters.categoryId = parseInt(categoryId as string);

    const data = await exportService.exportExpensesToJSON(filters);

    // Set headers for file download
    const filename = `expenses_${new Date().toISOString().split("T")[0]}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).json(data);
  } catch (error: any) {
    if (error.message === "No expenses found to export") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    console.error("Export JSON error:", error);
    res.status(500).json({ success: false, message: "Error exporting expenses" });
  }
};

/**
 * @swagger
 * /api/export/report/monthly:
 *   get:
 *     summary: Export monthly report to CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 */
export const exportMonthlyReportCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { year, month } = req.query;

    if (!year || !month) {
      res.status(400).json({ success: false, message: "Year and month are required" });
      return;
    }

    const y = parseInt(year as string);
    const m = parseInt(month as string);

    if (m < 1 || m > 12) {
      res.status(400).json({ success: false, message: "Month must be between 1 and 12" });
      return;
    }

    const csv = await exportService.exportMonthlyReportCSV(userId, y, m);

    const filename = `monthly_report_${y}_${m.toString().padStart(2, "0")}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error: any) {
    console.error("Export monthly report error:", error);
    res.status(500).json({ success: false, message: "Error exporting report" });
  }
};
