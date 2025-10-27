import { PrismaClient, CategoryType, TxnType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Check if DATABASE_URL is available before proceeding
if (!process.env.DATABASE_URL) {
  console.log('⊘ DATABASE_URL not found - skipping seed (this is normal during build)');
  process.exit(0);
}

const prisma = new PrismaClient();

// Type for Prisma transaction client
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

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
  await seedDefaultCategories(prisma, demoUser.id);

  // Seed default accounts
  await seedDefaultAccounts(prisma, demoUser.id);

  // Seed demo transactions (development only)
  if (process.env.NODE_ENV === 'development') {
    await seedDemoTransactions(prisma, demoUser.id);
  } else {
    console.log('⊘ Skipping demo transactions (not in development)');
  }

  console.log('✓ Database seed completed successfully!');
}

/**
 * Seeds default system categories for a user
 * Exported for reuse in AUTH-001 signup flow
 */
export async function seedDefaultCategories(tx: TransactionClient | PrismaClient, userId: string) {
  const categories = [
    // Expense categories
    {
      name: 'Groceries',
      color: '#10b981',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Dining Out',
      color: '#f59e0b',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Transport',
      color: '#3b82f6',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Utilities',
      color: '#8b5cf6',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Rent',
      color: '#ef4444',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Entertainment',
      color: '#ec4899',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Health',
      color: '#14b8a6',
      type: CategoryType.expense,
      isSystem: true,
    },
    {
      name: 'Shopping',
      color: '#f97316',
      type: CategoryType.expense,
      isSystem: true,
    },
    // Income categories
    {
      name: 'Salary',
      color: '#22c55e',
      type: CategoryType.income,
      isSystem: true,
    },
    {
      name: 'Other Income',
      color: '#84cc16',
      type: CategoryType.income,
      isSystem: true,
    },
  ];

  for (const category of categories) {
    // Check if category already exists for this user
    const existing = await tx.category.findFirst({
      where: {
        userId,
        name: category.name,
        type: category.type,
      },
    });

    if (!existing) {
      await tx.category.create({
        data: {
          ...category,
          userId,
        },
      });
    }
  }

  console.log(`✓ Created ${categories.length} default categories for user ${userId}`);
}

/**
 * Seeds default accounts for a user
 * Exported for reuse in AUTH-001 signup flow
 */
export async function seedDefaultAccounts(tx: TransactionClient | PrismaClient, userId: string) {
  const accounts = [
    { name: 'Cash', color: '#22c55e' },
    { name: 'Card', color: '#3b82f6' },
  ];

  for (const account of accounts) {
    // Check if account already exists for this user
    const existing = await tx.account.findFirst({
      where: {
        userId,
        name: account.name,
      },
    });

    if (!existing) {
      await tx.account.create({
        data: {
          ...account,
          userId,
        },
      });
    }
  }

  console.log(`✓ Created ${accounts.length} default accounts for user ${userId}`);
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

  const groceriesCategory = categories.find((c) => c.name === 'Groceries');
  const diningCategory = categories.find((c) => c.name === 'Dining Out');
  const transportCategory = categories.find((c) => c.name === 'Transport');
  const utilitiesCategory = categories.find((c) => c.name === 'Utilities');
  const rentCategory = categories.find((c) => c.name === 'Rent');
  const entertainmentCategory = categories.find((c) => c.name === 'Entertainment');
  const healthCategory = categories.find((c) => c.name === 'Health');
  const shoppingCategory = categories.find((c) => c.name === 'Shopping');
  const salaryCategory = categories.find((c) => c.name === 'Salary');
  const otherIncomeCategory = categories.find((c) => c.name === 'Other Income');

  const cashAccount = accounts.find((a) => a.name === 'Cash');
  const cardAccount = accounts.find((a) => a.name === 'Card');

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
