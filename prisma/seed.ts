import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data and reseeding with properly hashed passwords...');

  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create ADMIN User
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Aman',
      email: 'admin@finance.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create VIEWER User
  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer Demo',
      email: 'viewer@finance.com',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  // 3. Create Categories (for Admin)
  const incomeCategory = await prisma.category.create({
    data: { name: 'Salary', type: 'INCOME', userId: admin.id },
  });
  const foodCategory = await prisma.category.create({
    data: { name: 'Food & Dining', type: 'EXPENSE', budget: 5000, userId: admin.id },
  });
  const rentCategory = await prisma.category.create({
    data: { name: 'House Rent', type: 'EXPENSE', userId: admin.id },
  });

  // 4. Create Expenses / Incomes
  await prisma.expense.createMany({
    data: [
      { amount: 50000, description: 'Feb Salary', date: new Date('2026-02-01'), categoryId: incomeCategory.id, userId: admin.id },
      { amount: 50000, description: 'Mar Salary', date: new Date('2026-03-01'), categoryId: incomeCategory.id, userId: admin.id },
      { amount: 15000, description: 'Rent', date: new Date('2026-03-05'), categoryId: rentCategory.id, userId: admin.id },
      { amount: 1200, description: 'Pizza', date: new Date('2026-03-10'), categoryId: foodCategory.id, userId: admin.id },
      { amount: 800, description: 'Groceries', date: new Date('2026-03-14'), categoryId: foodCategory.id, userId: admin.id },
    ]
  });

  console.log('✅ Seed completed successfully! Test users available:');
  console.log('ADMIN: admin@finance.com | password123');
  console.log('VIEWER: viewer@finance.com | password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
