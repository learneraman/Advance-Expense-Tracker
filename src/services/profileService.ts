import bcrypt from "bcryptjs";
import { UserRepository, UpdateUserData } from "../repositories/userRepository";
import { User } from "../models/user";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export class ProfileService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: number): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Return user without password
    const { password, ...profile } = user;
    return profile as UserProfile;
  }

  /**
   * Update user profile (name, email)
   */
  async updateProfile(userId: number, payload: UpdateProfilePayload): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if email is being changed and if it's already taken
    if (payload.email && payload.email !== user.email) {
      const emailExists = await this.userRepository.emailExistsForOtherUser(payload.email, userId);
      if (emailExists) {
        throw new Error("Email is already in use");
      }
    }

    const updateData: UpdateUserData = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.email) updateData.email = payload.email;

    const updatedUser = await this.userRepository.update(userId, updateData);

    // Return user without password
    const { password, ...profile } = updatedUser;
    return profile as UserProfile;
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, payload: ChangePasswordPayload): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (payload.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: number, password: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify password before deletion
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }

    await this.userRepository.delete(userId);
  }
}
