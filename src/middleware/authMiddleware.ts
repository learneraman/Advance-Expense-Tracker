import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    status: string;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies the token from Authorization header and checks user status in DB
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access denied. No valid token provided.",
      });
      return;
    }

    const token = authHeader.slice(7);
    const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Fetch user from DB to ensure they are Active and get their Role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User not found." });
      return;
    }

    if (user.status === "INACTIVE") {
      res.status(403).json({ success: false, message: "Your account has been deactivated." });
      return;
    }

    // Add user info to request
    req.user = { 
      userId: user.id,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ success: false, message: "Token has expired. Please login again." });
      return;
    }
    res.status(401).json({ success: false, message: "Invalid token or authentication failed." });
  }
};

/**
 * Role Authorization Middleware
 * Put this AFTER the authenticate middleware!
 * Controls access based on user role.
 */
export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Action requires one of these roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user && user.status !== "INACTIVE") {
        req.user = { userId: user.id, role: user.role, status: user.status };
      }
    }
    next();
  } catch (error) {
    next();
  }
};
