import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { User } from "../models/user";

// Types for auth payloads
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  token: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
    this.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  }

  /**
   * Register a new user
   * - Check if email already exists
   * - Hash password with bcrypt
   * - Create user in database
   * - Generate JWT token
   */
  async registerUser(payload: RegisterPayload): Promise<AuthResponse> {
    const { name, email, password } = payload;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password (10 rounds of salt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, "password">,
      token,
    };
  }

  /**
   * Login user
   * - Find user by email
   * - Verify password with bcrypt
   * - Generate JWT token
   */
  async loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password } = payload;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, "password">,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: number): string {
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN as any,
    };
    return jwt.sign({ userId }, this.JWT_SECRET, options);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: number } {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: number };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}
