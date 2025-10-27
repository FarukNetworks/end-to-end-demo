import { PrismaClient } from '@prisma/client';

/**
 * Type for Prisma transaction client
 * Compatible with both direct PrismaClient and transaction context
 */
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

/**
 * Default accounts for new users
 * Provides basic Cash and Card accounts on signup
 */
export const defaultAccounts = [
  { name: 'Cash', color: '#22c55e' },
  { name: 'Card', color: '#3b82f6' },
] as const;

/**
 * Seeds default accounts for a user
 * Used in signup flow and seed script
 *
 * @param tx - Prisma client or transaction context
 * @param userId - User ID to associate accounts with
 * @param skipDuplicates - Skip if accounts already exist (default: true for idempotent seeding)
 */
export async function seedDefaultAccounts(
  tx: TransactionClient | PrismaClient,
  userId: string,
  skipDuplicates = true
) {
  if (skipDuplicates) {
    // Check if any accounts already exist for this user
    const existingCount = await tx.account.count({
      where: { userId },
    });

    if (existingCount > 0) {
      return; // Already seeded
    }
  }

  // Create all accounts
  await tx.account.createMany({
    data: defaultAccounts.map((account) => ({
      ...account,
      userId,
    })),
  });
}
