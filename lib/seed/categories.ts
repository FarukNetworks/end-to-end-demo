import { PrismaClient, CategoryType } from '@prisma/client';

/**
 * Type for Prisma transaction client
 * Compatible with both direct PrismaClient and transaction context
 */
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

/**
 * System default categories for new users
 * FR-016: Auto-create system categories on signup
 * 8 expense + 2 income categories with design token colors
 */
export const systemCategories = [
  // Expense categories
  { name: 'Groceries', color: '#10b981', type: CategoryType.expense },
  { name: 'Dining Out', color: '#f59e0b', type: CategoryType.expense },
  { name: 'Transport', color: '#3b82f6', type: CategoryType.expense },
  { name: 'Utilities', color: '#8b5cf6', type: CategoryType.expense },
  { name: 'Rent', color: '#ef4444', type: CategoryType.expense },
  { name: 'Entertainment', color: '#ec4899', type: CategoryType.expense },
  { name: 'Health', color: '#14b8a6', type: CategoryType.expense },
  { name: 'Shopping', color: '#f97316', type: CategoryType.expense },
  // Income categories
  { name: 'Salary', color: '#22c55e', type: CategoryType.income },
  { name: 'Other Income', color: '#84cc16', type: CategoryType.income },
] as const;

/**
 * Creates default system categories for a new user
 * Used in signup flow (AUTH-001) and seed script
 *
 * @param tx - Prisma client or transaction context
 * @param userId - User ID to associate categories with
 * @param skipDuplicates - Skip if categories already exist (default: true for idempotent seeding)
 * @returns Created categories count
 */
export async function createDefaultCategories(
  tx: TransactionClient | PrismaClient,
  userId: string,
  skipDuplicates = true
) {
  if (skipDuplicates) {
    // Check if categories already exist to avoid duplicates
    const existingCount = await tx.category.count({
      where: { userId, isSystem: true },
    });

    if (existingCount > 0) {
      return { count: 0 }; // Already seeded
    }
  }

  const categories = await tx.category.createMany({
    data: systemCategories.map((cat) => ({
      ...cat,
      userId,
      isSystem: true,
    })),
  });

  return categories;
}
