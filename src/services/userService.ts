import { UserRepository } from "../repositories/userRepository";
import { User } from "../models/user";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
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
}

