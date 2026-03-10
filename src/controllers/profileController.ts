import { Response } from "express";
import { ProfileService } from "../services/profileService";
import { AuthRequest } from "../middleware/authMiddleware";

const profileService = new ProfileService();

/**
 * Get current user profile
 * GET /api/profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

/**
 * Update user profile
 * PUT /api/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, email } = req.body;

    if (!name && !email) {
      res.status(400).json({
        success: false,
        message: "At least one field (name or email) is required",
      });
      return;
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
        return;
      }
    }

    const profile = await profileService.updateProfile(userId, { name, email });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("already in use") ? 409 : 
                       error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

/**
 * Change password
 * PUT /api/profile/password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
      return;
    }

    await profileService.changePassword(userId, { currentPassword, newPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("incorrect") ? 401 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

/**
 * Delete account
 * DELETE /api/profile
 */
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
      return;
    }

    await profileService.deleteAccount(userId, password);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("incorrect") ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete account",
    });
  }
};
