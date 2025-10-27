import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createDefaultCategories } from '@/lib/seed/categories';
import { seedDefaultAccounts } from '@/lib/seed/accounts';

// Enum for transaction types (matches Prisma schema)
enum TxnType {
  expense = 'expense',
  income = 'income',
}

// Check if DATABASE_URL is available before proceeding
if (!process.env.DATABASE_URL) {
  console.log('⊘ DATABASE_URL not found - skipping seed (this is normal during build)');
  process.exit(0);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo user for development
  const passwordHash = await bcrypt.hash('password', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@budgetbuddy.app' },
    update: {},
    create: {
      email: 'demo@budgetbuddy.app',
      passwordHash,
      name: 'Demo User',
    },
  });

  console.log('✓ Created demo user:', demoUser.email);

  // Seed default categories
  await createDefaultCategories(prisma, demoUser.id);
  console.log('✓ Created 10 default categories for demo user');

  // Seed default accounts
  await seedDefaultAccounts(prisma, demoUser.id);
  console.log('✓ Created 2 default accounts for demo user');

  // Seed demo transactions (development only)
  if (process.env.NODE_ENV === 'development') {
    await seedDemoTransactions(prisma, demoUser.id);
  } else {
    console.log('⊘ Skipping demo transactions (not in development)');
  }

  console.log('✓ Database seed completed successfully!');
}

/**
 * Seeds demo transactions for development environment
 * Internal function - not exported
 */
async function seedDemoTransactions(prisma: PrismaClient, userId: string) {
  // Check if demo transactions already exist
  const existingTransactions = await prisma.transaction.count({ where: { userId } });
  if (existingTransactions > 0) {
    console.log('⊘ Demo transactions already exist, skipping');
    return;
  }

  const categories = await prisma.category.findMany({ where: { userId } });
  const accounts = await prisma.account.findMany({ where: { userId } });

  type Category = (typeof categories)[0];
  type Account = (typeof accounts)[0];

  const groceriesCategory = categories.find((c: Category) => c.name === 'Groceries');
  const diningCategory = categories.find((c: Category) => c.name === 'Dining Out');
  const transportCategory = categories.find((c: Category) => c.name === 'Transport');
  const utilitiesCategory = categories.find((c: Category) => c.name === 'Utilities');
  const rentCategory = categories.find((c: Category) => c.name === 'Rent');
  const entertainmentCategory = categories.find((c: Category) => c.name === 'Entertainment');
  const healthCategory = categories.find((c: Category) => c.name === 'Health');
  const shoppingCategory = categories.find((c: Category) => c.name === 'Shopping');
  const salaryCategory = categories.find((c: Category) => c.name === 'Salary');
  const otherIncomeCategory = categories.find((c: Category) => c.name === 'Other Income');

  const cashAccount = accounts.find((a: Account) => a.name === 'Cash');
  const cardAccount = accounts.find((a: Account) => a.name === 'Card');

  if (!groceriesCategory || !cashAccount || !cardAccount || !salaryCategory) {
    console.warn('⚠ Required categories or accounts not found for demo data');
    return;
  }

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const transactions = [
    // Last month income
    {
      userId,
      amount: 3000,
      currency: 'EUR',
      type: TxnType.income,
      categoryId: salaryCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
      note: 'Monthly salary',
    },
    {
      userId,
      amount: 150,
      currency: 'EUR',
      type: TxnType.income,
      categoryId: otherIncomeCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(lastMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
      note: 'Freelance work',
    },
    // Last month expenses
    {
      userId,
      amount: 95.5,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: groceriesCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      note: 'Weekly groceries - Supermarket',
    },
    {
      userId,
      amount: 78.25,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: groceriesCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      note: 'Weekly groceries',
    },
    {
      userId,
      amount: 1200,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: rentCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
      note: 'Monthly rent',
    },
    {
      userId,
      amount: 45.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: diningCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(lastMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      note: 'Dinner with friends',
    },
    {
      userId,
      amount: 32.5,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: diningCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
      note: 'Lunch meeting',
    },
    {
      userId,
      amount: 60.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: transportCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      note: 'Monthly transit pass',
    },
    {
      userId,
      amount: 150.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: utilitiesCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
      note: 'Electricity and water',
    },
    {
      userId,
      amount: 89.99,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: entertainmentCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 12 * 24 * 60 * 60 * 1000),
      note: 'Concert tickets',
    },
    {
      userId,
      amount: 25.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: healthCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(lastMonth.getTime() + 20 * 24 * 60 * 60 * 1000),
      note: 'Pharmacy',
    },
    {
      userId,
      amount: 120.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: shoppingCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(lastMonth.getTime() + 18 * 24 * 60 * 60 * 1000),
      note: 'Clothing',
    },
    // This month income
    {
      userId,
      amount: 3000,
      currency: 'EUR',
      type: TxnType.income,
      categoryId: salaryCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
      note: 'Monthly salary',
    },
    // This month expenses
    {
      userId,
      amount: 1200,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: rentCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
      note: 'Monthly rent',
    },
    {
      userId,
      amount: 85.5,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: groceriesCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      note: 'Weekly groceries',
    },
    {
      userId,
      amount: 92.3,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: groceriesCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 12 * 24 * 60 * 60 * 1000),
      note: 'Weekly groceries',
    },
    {
      userId,
      amount: 105.75,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: groceriesCategory.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 19 * 24 * 60 * 60 * 1000),
      note: 'Weekly groceries + household items',
    },
    {
      userId,
      amount: 52.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: diningCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
      note: 'Weekend brunch',
    },
    {
      userId,
      amount: 38.5,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: diningCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(thisMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
      note: 'Pizza delivery',
    },
    {
      userId,
      amount: 60.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: transportCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      note: 'Monthly transit pass',
    },
    {
      userId,
      amount: 45.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: transportCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(thisMonth.getTime() + 16 * 24 * 60 * 60 * 1000),
      note: 'Taxi ride',
    },
    {
      userId,
      amount: 155.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: utilitiesCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
      note: 'Electricity and water',
    },
    {
      userId,
      amount: 49.99,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: utilitiesCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      note: 'Internet bill',
    },
    {
      userId,
      amount: 15.99,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: entertainmentCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 8 * 24 * 60 * 60 * 1000),
      note: 'Netflix subscription',
    },
    {
      userId,
      amount: 42.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: entertainmentCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(thisMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
      note: 'Movie night',
    },
    {
      userId,
      amount: 75.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: healthCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 11 * 24 * 60 * 60 * 1000),
      note: 'Dentist appointment',
    },
    {
      userId,
      amount: 18.5,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: healthCategory!.id,
      accountId: cashAccount.id,
      txnDate: new Date(thisMonth.getTime() + 17 * 24 * 60 * 60 * 1000),
      note: 'Vitamins',
    },
    {
      userId,
      amount: 89.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: shoppingCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 9 * 24 * 60 * 60 * 1000),
      note: 'Shoes',
    },
    {
      userId,
      amount: 65.0,
      currency: 'EUR',
      type: TxnType.expense,
      categoryId: shoppingCategory!.id,
      accountId: cardAccount.id,
      txnDate: new Date(thisMonth.getTime() + 20 * 24 * 60 * 60 * 1000),
      note: 'Books',
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({ data: transaction });
  }

  console.log(`✓ Created ${transactions.length} demo transactions`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
