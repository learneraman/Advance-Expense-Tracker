import { Request, Response } from "express";
import { UserService } from "../services/userService";

const userService = new UserService();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await userService.registerUser({ name, email, password });
    res.status(201).json({ data: user });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Unable to register user" });
  }
};

