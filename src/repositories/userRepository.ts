import prisma from "../lib/prisma";
import { User } from "../models/user";

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } }) as unknown as User | null;
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } }) as unknown as User | null;
  }

  async create(data: Omit<User, "id" | "createdAt">): Promise<User> {
    return prisma.user.create({ data }) as unknown as User;
  }

  async update(id: number, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    }) as unknown as User;
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } }) as unknown as User;
  }

  async emailExistsForOtherUser(email: string, excludeUserId: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        id: { not: excludeUserId },
      },
    });
    return !!user;
  }
}

