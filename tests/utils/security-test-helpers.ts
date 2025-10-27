import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * Creates test users with unique emails for security testing
 * Each user has a hashed password and unique identifier
 *
 * @returns Object containing two test users
 */
export async function createTestUsers() {
  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('TestPassword123!', 10);

  const user1 = await db.user.create({
    data: {
      email: `user1-${timestamp}@test.com`,
      passwordHash,
      name: 'Test User 1',
    },
  });

  const user2 = await db.user.create({
    data: {
      email: `user2-${timestamp}@test.com`,
      passwordHash,
      name: 'Test User 2',
    },
  });

  return { user1, user2 };
}

/**
 * Tests cross-user access scenarios
 * Ensures that queries properly enforce user scoping
 *
 * @param query - The database query to execute
 * @param shouldSucceed - Whether the query should return data (true) or be blocked (false)
 * @returns The query result if shouldSucceed is true
 * @throws Error if access control is violated
 */
export async function testCrossUserAccess<T>(
  query: () => Promise<T>,
  shouldSucceed: boolean
): Promise<T | null> {
  try {
    const result = await query();

    // If we expect blocking but got data, that's a security violation
    if (!shouldSucceed && result) {
      // Check if result is an array with items or an object with data
      const hasData = Array.isArray(result)
        ? result.length > 0
        : result && typeof result === 'object' && Object.keys(result).length > 0;

      if (hasData) {
        throw new Error(
          'Cross-user access violation: query returned data when it should have been blocked'
        );
      }
    }

    return result;
  } catch (error) {
    // If we expect success but got an error, re-throw
    if (shouldSucceed) {
      throw error;
    }
    // Expected failure, return null
    return null;
  }
}

/**
 * Cleans up test users and all their related data
 * Useful for test teardown to avoid database bloat
 *
 * @param userIds - Array of user IDs to delete
 */
export async function cleanupTestUsers(userIds: string[]) {
  // Delete in correct order to respect foreign key constraints
  // 1. Delete transactions (references accounts and categories)
  await db.transaction.deleteMany({
    where: { userId: { in: userIds } },
  });

  // 2. Delete budgets (references categories)
  await db.budget.deleteMany({
    where: { userId: { in: userIds } },
  });

  // 3. Delete accounts
  await db.account.deleteMany({
    where: { userId: { in: userIds } },
  });

  // 4. Delete categories
  await db.category.deleteMany({
    where: { userId: { in: userIds } },
  });

  // 5. Finally delete users
  await db.user.deleteMany({
    where: { id: { in: userIds } },
  });
}

/**
 * Creates test data for a specific user
 * Useful for setting up test scenarios
 *
 * @param userId - The user ID to create data for
 */
export async function createTestDataForUser(userId: string) {
  // Create a test category
  const category = await db.category.create({
    data: {
      userId,
      name: 'Test Category',
      type: 'expense',
      color: '#ff0000',
    },
  });

  // Create a test account
  const account = await db.account.create({
    data: {
      userId,
      name: 'Test Account',
      color: '#00ff00',
    },
  });

  // Create a test transaction
  const transaction = await db.transaction.create({
    data: {
      userId,
      accountId: account.id,
      categoryId: category.id,
      amount: 100.5,
      type: 'expense',
      txnDate: new Date(),
      note: 'Test transaction',
    },
  });

  // Create a test budget
  const budget = await db.budget.create({
    data: {
      userId,
      categoryId: category.id,
      year: 2025,
      month: 10,
      targetAmount: 1000,
    },
  });

  return {
    category,
    account,
    transaction,
    budget,
  };
}
