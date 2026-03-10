import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies the token from Authorization header
 * Adds decoded user info to request object
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    // Check for Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Invalid token format. Use: Bearer <token>",
      });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.slice(7);

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Add user info to request
    req.user = { userId: decoded.userId };

    // Continue to next middleware/controller
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

/**
 * Optional authentication middleware
 * Doesn't block if no token, but adds user info if token is valid
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      req.user = { userId: decoded.userId };
    }

    next();
  } catch (error) {
    // Token invalid but we continue anyway (optional auth)
    next();
  }
};
