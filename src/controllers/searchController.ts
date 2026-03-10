import { Request, Response } from "express";
import { SearchService } from "../services/searchService";

const searchService = new SearchService();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search expenses
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
export const searchExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { q, startDate, endDate, minAmount, maxAmount, categoryId, limit } = req.query;

    if (!q || (q as string).trim().length === 0) {
      res.status(400).json({ success: false, message: "Search query 'q' is required" });
      return;
    }

    const params = {
      userId,
      query: (q as string).trim(),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
    };

    const results = await searchService.searchExpenses(params);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Error searching expenses" });
  }
};

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { q } = req.query;

    if (!q || (q as string).trim().length < 2) {
      res.status(400).json({ success: false, message: "Query must be at least 2 characters" });
      return;
    }

    const suggestions = await searchService.getSearchSuggestions(userId, (q as string).trim());

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    console.error("Search suggestions error:", error);
    res.status(500).json({ success: false, message: "Error fetching suggestions" });
  }
};
