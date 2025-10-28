import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateAccountBalance, getAccountsWithBalances } from '@/lib/queries/accounts';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { TxnType } from '@prisma/client';

// Helper to create test user
async function createTestUser(email: string, password: string, name?: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return await db.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
    },
  });
}

// Helper to clean up test user
async function cleanupTestUser(userId: string) {
  await db.transaction.deleteMany({ where: { userId } });
  await db.budget.deleteMany({ where: { userId } });
  await db.account.deleteMany({ where: { userId } });
  await db.category.deleteMany({ where: { userId } });
  await db.user.delete({ where: { id: userId } });
}

describe('Account Balance Queries', () => {
  const testEmail = 'balance-test@example.com';
  const testPassword = 'SecurePassword123';
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser(testEmail, testPassword, 'Balance Test User');
  });

  afterEach(async () => {
    await cleanupTestUser(testUser.id);
  });

  describe('calculateAccountBalance', () => {
    it('should calculate balance with mixed income and expense transactions', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#3b82f6',
        },
      });

      // Create categories
      const incomeCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Salary',
          type: 'income',
          color: '#22c55e',
        },
      });

      const expenseCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: 'expense',
          color: '#ef4444',
        },
      });

      // Create transactions: €1000 income, €400 expense
      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: incomeCategory.id,
            amount: 1000,
            type: TxnType.income,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: expenseCategory.id,
            amount: 400,
            type: TxnType.expense,
            txnDate: new Date(),
          },
        ],
      });

      const balance = await calculateAccountBalance(testUser.id, account.id);

      // Expected: 1000 - 400 = 600
      expect(balance).toBe(600);
    });

    it('should return 0 for account with no transactions', async () => {
      // Create account with no transactions
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Empty Account',
          color: '#3b82f6',
        },
      });

      const balance = await calculateAccountBalance(testUser.id, account.id);

      expect(balance).toBe(0);
    });

    it('should round balance to 2 decimal places', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#3b82f6',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Test',
          type: 'income',
          color: '#22c55e',
        },
      });

      // Create transactions with amounts that will create many decimals
      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 10.33,
            type: TxnType.income,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 20.67,
            type: TxnType.income,
            txnDate: new Date(),
          },
        ],
      });

      const balance = await calculateAccountBalance(testUser.id, account.id);

      // Expected: 10.33 + 20.67 = 31.00
      expect(balance).toBe(31);
      // Verify it's exactly 2 decimal places (no floating point issues)
      expect(balance.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    });

    it('should only count transactions for the specified user', async () => {
      // Create account for test user
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#3b82f6',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Income',
          type: 'income',
          color: '#22c55e',
        },
      });

      // Add transaction for test user
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account.id,
          categoryId: category.id,
          amount: 100,
          type: TxnType.income,
          txnDate: new Date(),
        },
      });

      // Create another user
      const otherUser = await createTestUser('other@example.com', testPassword);
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Income',
          type: 'income',
          color: '#22c55e',
        },
      });

      // Try to add transaction to test user's account from other user
      // (This would violate business logic, but testing isolation)
      await db.transaction.create({
        data: {
          userId: otherUser.id,
          accountId: account.id,
          categoryId: otherCategory.id,
          amount: 500,
          type: TxnType.income,
          txnDate: new Date(),
        },
      });

      const balance = await calculateAccountBalance(testUser.id, account.id);

      // Should only count test user's transaction (100), not other user's (500)
      expect(balance).toBe(100);

      // Cleanup other user
      await cleanupTestUser(otherUser.id);
    });

    it('should handle only income transactions', async () => {
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#3b82f6',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Income',
          type: 'income',
          color: '#22c55e',
        },
      });

      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 100,
            type: TxnType.income,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 200,
            type: TxnType.income,
            txnDate: new Date(),
          },
        ],
      });

      const balance = await calculateAccountBalance(testUser.id, account.id);

      expect(balance).toBe(300);
    });

    it('should handle only expense transactions', async () => {
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#3b82f6',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Expenses',
          type: 'expense',
          color: '#ef4444',
        },
      });

      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 50,
            type: TxnType.expense,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 75,
            type: TxnType.expense,
            txnDate: new Date(),
          },
        ],
      });

      const balance = await calculateAccountBalance(testUser.id, account.id);

      // Balance should be negative: 0 - 50 - 75 = -125
      expect(balance).toBe(-125);
    });
  });

  describe('getAccountsWithBalances', () => {
    it('should return all accounts with balances and transaction counts', async () => {
      // Create two accounts
      const account1 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking',
          color: '#3b82f6',
        },
      });

      const account2 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Savings',
          color: '#22c55e',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Income',
          type: 'income',
          color: '#22c55e',
        },
      });

      // Add different amounts to each account
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account1.id,
          categoryId: category.id,
          amount: 100,
          type: TxnType.income,
          txnDate: new Date(),
        },
      });

      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account2.id,
            categoryId: category.id,
            amount: 200,
            type: TxnType.income,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account2.id,
            categoryId: category.id,
            amount: 50,
            type: TxnType.income,
            txnDate: new Date(),
          },
        ],
      });

      const accounts = await getAccountsWithBalances(testUser.id);

      expect(accounts).toHaveLength(2);

      const checking = accounts.find((a) => a.name === 'Checking');
      const savings = accounts.find((a) => a.name === 'Savings');

      expect(checking).toBeDefined();
      expect(checking?.balance).toBe(100);
      expect(checking?._count.txns).toBe(1);

      expect(savings).toBeDefined();
      expect(savings?.balance).toBe(250);
      expect(savings?._count.txns).toBe(2);
    });

    it('should return empty array when user has no accounts', async () => {
      const accounts = await getAccountsWithBalances(testUser.id);

      expect(accounts).toEqual([]);
    });

    it('should order accounts by createdAt ascending', async () => {
      // Create accounts with slight delay to ensure different timestamps
      const account1 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'First Account',
          color: '#3b82f6',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const account2 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Second Account',
          color: '#22c55e',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const account3 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Third Account',
          color: '#ef4444',
        },
      });

      const accounts = await getAccountsWithBalances(testUser.id);

      expect(accounts).toHaveLength(3);
      expect(accounts[0].id).toBe(account1.id);
      expect(accounts[0].name).toBe('First Account');
      expect(accounts[1].id).toBe(account2.id);
      expect(accounts[1].name).toBe('Second Account');
      expect(accounts[2].id).toBe(account3.id);
      expect(accounts[2].name).toBe('Third Account');
    });

    it('should only return accounts for the specified user', async () => {
      // Create account for test user
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'My Account',
          color: '#3b82f6',
        },
      });

      // Create another user with account
      const otherUser = await createTestUser('other@example.com', testPassword);
      await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
          color: '#ef4444',
        },
      });

      const accounts = await getAccountsWithBalances(testUser.id);

      expect(accounts).toHaveLength(1);
      expect(accounts[0].name).toBe('My Account');
      expect(accounts[0].userId).toBe(testUser.id);

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });

    it('should include all account properties', async () => {
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#3b82f6',
        },
      });

      const accounts = await getAccountsWithBalances(testUser.id);

      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toHaveProperty('id');
      expect(accounts[0]).toHaveProperty('userId');
      expect(accounts[0]).toHaveProperty('name');
      expect(accounts[0]).toHaveProperty('color');
      expect(accounts[0]).toHaveProperty('createdAt');
      expect(accounts[0]).toHaveProperty('balance');
      expect(accounts[0]).toHaveProperty('_count');
      expect(accounts[0]._count).toHaveProperty('txns');

      expect(accounts[0].id).toBe(account.id);
      expect(accounts[0].name).toBe('Test Account');
      expect(accounts[0].color).toBe('#3b82f6');
    });
  });
});
