import { db } from '@/lib/db';

/**
 * Calculate the balance for a specific account
 * Formula: sum(income) - sum(expense)
 *
 * @param userId - The user ID (for authorization)
 * @param accountId - The account ID to calculate balance for
 * @returns Balance rounded to 2 decimal places
 */
export async function calculateAccountBalance(userId: string, accountId: string): Promise<number> {
  const result = await db.transaction.groupBy({
    by: ['type'],
    where: {
      accountId,
      userId,
    },
    _sum: {
      amount: true,
    },
  });

  const income = result.find((r) => r.type === 'income')?._sum.amount || 0;
  const expense = result.find((r) => r.type === 'expense')?._sum.amount || 0;

  // Convert Decimal to number and round to 2 decimal places
  return Number((Number(income) - Number(expense)).toFixed(2));
}

/**
 * Get all accounts for a user with calculated balances
 *
 * @param userId - The user ID
 * @returns Array of accounts with balance and transaction count
 */
export async function getAccountsWithBalances(userId: string) {
  const accounts = await db.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { txns: true },
      },
    },
  });

  // Calculate balance for each account
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => {
      const balance = await calculateAccountBalance(userId, account.id);
      return {
        ...account,
        balance,
      };
    })
  );

  return accountsWithBalances;
}
