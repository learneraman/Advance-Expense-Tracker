import { Response } from "express";
import { DashboardService } from "../services/dashboardService";
import { AuthRequest } from "../middleware/authMiddleware";

const dashboardService = new DashboardService();

/**
 * Get dashboard statistics
 * GET /api/dashboard
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const stats = await dashboardService.getDashboardStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
};

/**
 * Get monthly report
 * GET /api/dashboard/report/monthly?year=2026&month=2
 */
export const getMonthlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
      res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
      return;
    }

    const report = await dashboardService.getMonthlyReport(userId, year, month);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch monthly report",
    });
  }
};

/**
 * Get yearly report
 * GET /api/dashboard/report/yearly?year=2026
 */
export const getYearlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const report = await dashboardService.getYearlyReport(userId, year);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch yearly report",
    });
  }
};
