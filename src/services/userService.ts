import { UserRepository } from "../repositories/userRepository";
import { User } from "../models/user";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async registerUser(payload: { name: string; email: string; password: string }): Promise<User> {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // NOTE: In a real app, hash the password with bcrypt before saving.
    return this.userRepository.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
  }

  async updateUserRole(userId: number, newRole: "VIEWER" | "ANALYST" | "ADMIN"): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    
    return this.userRepository.update(userId, { role: newRole });
  }

  async updateUserStatus(userId: number, newStatus: "ACTIVE" | "INACTIVE"): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    return this.userRepository.update(userId, { status: newStatus });
  }
}

