import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    // Password length validation
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("already exists") ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("Invalid") ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};
