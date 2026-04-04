import { Request, Response } from "express";
import { UserService } from "../services/userService";

const userService = new UserService();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await userService.registerUser({ name, email, password });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Unable to register user" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const { role } = req.body;
    
    if (!["VIEWER", "ANALYST", "ADMIN"].includes(role)) {
       res.status(400).json({ success: false, message: "Invalid role specified" });
       return;
    }

    const updatedUser = await userService.updateUserRole(userId, role);
    res.status(200).json({ success: true, data: updatedUser, message: "User role updated" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update role" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const { status } = req.body;
    
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
       res.status(400).json({ success: false, message: "Invalid status specified" });
       return;
    }

    const updatedUser = await userService.updateUserStatus(userId, status);
    res.status(200).json({ success: true, data: updatedUser, message: "User status updated" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update status" });
  }
};

