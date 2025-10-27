import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createScopedQueries } from '@/lib/db-helpers';
import {
  createTestUsers,
  cleanupTestUsers,
  createTestDataForUser,
} from './utils/security-test-helpers';
import { db } from '@/lib/db';

describe('User Scoping Enforcement', () => {
  let user1Id: string;
  let user2Id: string;
  let user1Data: Awaited<ReturnType<typeof createTestDataForUser>>;
  let user2Data: Awaited<ReturnType<typeof createTestDataForUser>>;

  beforeAll(async () => {
    // Create two test users
    const { user1, user2 } = await createTestUsers();
    user1Id = user1.id;
    user2Id = user2.id;

    // Create test data for both users
    user1Data = await createTestDataForUser(user1Id);
    user2Data = await createTestDataForUser(user2Id);
  });

  afterAll(async () => {
    // Clean up test users and their data
    await cleanupTestUsers([user1Id, user2Id]);
  });

  describe('Transaction Scoping', () => {
    it('should only return transactions for the current user', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const scoped2 = createScopedQueries(user2Id);

      const user1Transactions = await scoped1.transactions.findMany();
      const user2Transactions = await scoped2.transactions.findMany();

      // Each user should only see their own transaction
      expect(user1Transactions).toHaveLength(1);
      expect(user2Transactions).toHaveLength(1);
      expect(user1Transactions[0].id).toBe(user1Data.transaction.id);
      expect(user2Transactions[0].id).toBe(user2Data.transaction.id);
    });

    it('should not allow user2 to access user1 transaction by ID', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.transactions.findUnique(user1Data.transaction.id);

      expect(result).toBeNull();
    });

    it('should not allow user2 to update user1 transaction', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.transactions.update(user1Data.transaction.id, {
        note: 'Attempted unauthorized update',
      });

      expect(result.count).toBe(0);

      // Verify the original transaction was not modified
      const original = await db.transaction.findUnique({
        where: { id: user1Data.transaction.id },
      });
      expect(original?.note).toBe('Test transaction');
    });

    it('should not allow user2 to delete user1 transaction', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.transactions.delete(user1Data.transaction.id);

      expect(result.count).toBe(0);

      // Verify the transaction still exists
      const original = await db.transaction.findUnique({
        where: { id: user1Data.transaction.id },
      });
      expect(original).not.toBeNull();
    });

    it('should allow user to update their own transaction', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const result = await scoped1.transactions.update(user1Data.transaction.id, {
        note: 'Updated by owner',
      });

      expect(result.count).toBe(1);

      // Verify the update was applied
      const updated = await db.transaction.findUnique({
        where: { id: user1Data.transaction.id },
      });
      expect(updated?.note).toBe('Updated by owner');
    });

    it('should count only user transactions', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const count = await scoped1.transactions.count();

      expect(count).toBe(1);
    });
  });

  describe('Category Scoping', () => {
    it('should only return categories for the current user', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const scoped2 = createScopedQueries(user2Id);

      const user1Categories = await scoped1.categories.findMany();
      const user2Categories = await scoped2.categories.findMany();

      expect(user1Categories).toHaveLength(1);
      expect(user2Categories).toHaveLength(1);
      expect(user1Categories[0].id).toBe(user1Data.category.id);
      expect(user2Categories[0].id).toBe(user2Data.category.id);
    });

    it('should not allow user2 to access user1 category by ID', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.categories.findUnique(user1Data.category.id);

      expect(result).toBeNull();
    });

    it('should not allow user2 to update user1 category', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.categories.update(user1Data.category.id, {
        name: 'Attempted unauthorized update',
      });

      expect(result.count).toBe(0);
    });

    it('should not allow user2 to delete user1 category', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.categories.delete(user1Data.category.id);

      expect(result.count).toBe(0);

      // Verify the category still exists
      const original = await db.category.findUnique({
        where: { id: user1Data.category.id },
      });
      expect(original).not.toBeNull();
    });

    it('should count only user categories', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const count = await scoped1.categories.count();

      expect(count).toBe(1);
    });
  });

  describe('Account Scoping', () => {
    it('should only return accounts for the current user', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const scoped2 = createScopedQueries(user2Id);

      const user1Accounts = await scoped1.accounts.findMany();
      const user2Accounts = await scoped2.accounts.findMany();

      expect(user1Accounts).toHaveLength(1);
      expect(user2Accounts).toHaveLength(1);
      expect(user1Accounts[0].id).toBe(user1Data.account.id);
      expect(user2Accounts[0].id).toBe(user2Data.account.id);
    });

    it('should not allow user2 to access user1 account by ID', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.accounts.findUnique(user1Data.account.id);

      expect(result).toBeNull();
    });

    it('should not allow user2 to update user1 account', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.accounts.update(user1Data.account.id, {
        name: 'Attempted unauthorized update',
      });

      expect(result.count).toBe(0);
    });

    it('should not allow user2 to delete user1 account', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.accounts.delete(user1Data.account.id);

      expect(result.count).toBe(0);

      // Verify the account still exists
      const original = await db.account.findUnique({
        where: { id: user1Data.account.id },
      });
      expect(original).not.toBeNull();
    });

    it('should count only user accounts', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const count = await scoped1.accounts.count();

      expect(count).toBe(1);
    });
  });

  describe('Budget Scoping', () => {
    it('should only return budgets for the current user', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const scoped2 = createScopedQueries(user2Id);

      const user1Budgets = await scoped1.budgets.findMany();
      const user2Budgets = await scoped2.budgets.findMany();

      expect(user1Budgets).toHaveLength(1);
      expect(user2Budgets).toHaveLength(1);
      expect(user1Budgets[0].id).toBe(user1Data.budget.id);
      expect(user2Budgets[0].id).toBe(user2Data.budget.id);
    });

    it('should not allow user2 to access user1 budget by ID', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.budgets.findUnique(user1Data.budget.id);

      expect(result).toBeNull();
    });

    it('should not allow user2 to update user1 budget', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.budgets.update(user1Data.budget.id, {
        targetAmount: 9999,
      });

      expect(result.count).toBe(0);
    });

    it('should not allow user2 to delete user1 budget', async () => {
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.budgets.delete(user1Data.budget.id);

      expect(result.count).toBe(0);

      // Verify the budget still exists
      const original = await db.budget.findUnique({
        where: { id: user1Data.budget.id },
      });
      expect(original).not.toBeNull();
    });

    it('should count only user budgets', async () => {
      const scoped1 = createScopedQueries(user1Id);
      const count = await scoped1.budgets.count();

      expect(count).toBe(1);
    });
  });

  describe('Cross-Resource Scoping', () => {
    it('should enforce scoping when querying with filters', async () => {
      const scoped2 = createScopedQueries(user2Id);

      // Try to query user1's transactions with additional filters
      const result = await scoped2.transactions.findMany({
        where: {
          accountId: user1Data.account.id,
        },
      });

      expect(result).toHaveLength(0);
    });

    it('should enforce scoping on nested queries', async () => {
      const scoped1 = createScopedQueries(user1Id);

      // Query transactions with nested relations
      const transactions = await scoped1.transactions.findMany({
        include: {
          category: true,
          account: true,
        },
      });

      expect(transactions).toHaveLength(1);
      expect((transactions[0] as any).category.id).toBe(user1Data.category.id);
      expect((transactions[0] as any).account.id).toBe(user1Data.account.id);
    });
  });

  describe('Create Operations', () => {
    it('should create transaction with correct userId', async () => {
      const scoped1 = createScopedQueries(user1Id);

      const newTransaction = await scoped1.transactions.create({
        account: { connect: { id: user1Data.account.id } },
        category: { connect: { id: user1Data.category.id } },
        amount: 50.25,
        type: 'expense',
        txnDate: new Date(),
        note: 'New test transaction',
      });

      expect(newTransaction.userId).toBe(user1Id);

      // Verify user2 cannot see it
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.transactions.findUnique(newTransaction.id);
      expect(result).toBeNull();

      // Clean up
      await db.transaction.delete({ where: { id: newTransaction.id } });
    });

    it('should create category with correct userId', async () => {
      const scoped1 = createScopedQueries(user1Id);

      const newCategory = await scoped1.categories.create({
        name: 'New Test Category',
        type: 'income',
        color: '#0000ff',
      });

      expect(newCategory.userId).toBe(user1Id);

      // Verify user2 cannot see it
      const scoped2 = createScopedQueries(user2Id);
      const result = await scoped2.categories.findUnique(newCategory.id);
      expect(result).toBeNull();

      // Clean up
      await db.category.delete({ where: { id: newCategory.id } });
    });
  });
});
