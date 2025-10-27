import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkReassignCategory,
  bulkDeleteTransactions,
} from '@/lib/queries/transactions';
import { TxnType } from '@prisma/client';

describe('Transaction Query Helpers', () => {
  let testUser1Id: string;
  let testUser2Id: string;
  let categoryId: string;
  let accountId: string;

  beforeAll(async () => {
    // Setup test users with unique emails using timestamps
    const timestamp = Date.now();
    const user1 = await db.user.create({
      data: { email: `txn-user1-${timestamp}@test.com`, passwordHash: 'hash', name: 'User 1' },
    });
    testUser1Id = user1.id;

    const user2 = await db.user.create({
      data: { email: `txn-user2-${timestamp}@test.com`, passwordHash: 'hash', name: 'User 2' },
    });
    testUser2Id = user2.id;

    // Setup category and account for user1
    const category = await db.category.create({
      data: {
        userId: testUser1Id,
        name: 'Food',
        color: '#22c55e',
        type: 'expense',
      },
    });
    categoryId = category.id;

    const account = await db.account.create({
      data: {
        userId: testUser1Id,
        name: 'Checking',
        color: '#6b7280',
      },
    });
    accountId = account.id;
  });

  afterAll(async () => {
    // Clean up in correct order to respect foreign keys
    await db.transaction.deleteMany({ where: { userId: { in: [testUser1Id, testUser2Id] } } });
    await db.budget.deleteMany({ where: { userId: { in: [testUser1Id, testUser2Id] } } });
    await db.category.deleteMany({ where: { userId: { in: [testUser1Id, testUser2Id] } } });
    await db.account.deleteMany({ where: { userId: { in: [testUser1Id, testUser2Id] } } });
    await db.user.deleteMany({ where: { id: { in: [testUser1Id, testUser2Id] } } });
  });

  describe('getTransactions', () => {
    it('returns only user transactions', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const result = await getTransactions(testUser1Id);
      expect(result.transactions.length).toBeGreaterThanOrEqual(1);
      expect(result.transactions.some((t) => t.id === txn.id)).toBe(true);

      const result2 = await getTransactions(testUser2Id);
      expect(result2.transactions.every((t) => t.id !== txn.id)).toBe(true);

      // Cleanup
      await db.transaction.delete({ where: { id: txn.id } });
    });

    it('filters by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: yesterday,
        categoryId,
        accountId,
      });

      const result = await getTransactions(testUser1Id, {
        from: today,
      });
      expect(result.transactions.every((t) => t.id !== txn.id)).toBe(true);

      const result2 = await getTransactions(testUser1Id, {
        to: today,
      });
      expect(result2.transactions.some((t) => t.id === txn.id)).toBe(true);

      // Cleanup
      await db.transaction.delete({ where: { id: txn.id } });
    });

    it('supports pagination', async () => {
      const txnIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const txn = await createTransaction(testUser1Id, {
          amount: i * 10,
          type: TxnType.expense,
          txnDate: new Date(),
          categoryId,
          accountId,
        });
        txnIds.push(txn.id);
      }

      const result = await getTransactions(testUser1Id, {}, { take: 2, skip: 0 });
      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBeGreaterThanOrEqual(5);

      // Cleanup
      await db.transaction.deleteMany({ where: { id: { in: txnIds } } });
    }, 10000);

    it('includes related data', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const result = await getTransactions(testUser1Id);
      const createdTxn = result.transactions.find((t) => t.id === txn.id);
      expect(createdTxn?.category).toBeDefined();
      expect(createdTxn?.account).toBeDefined();

      // Cleanup
      await db.transaction.delete({ where: { id: txn.id } });
    });
  });

  describe('getTransaction', () => {
    it('returns transaction for owner', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const result = await getTransaction(testUser1Id, txn.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(txn.id);
    });

    it('returns null for non-owner', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const result = await getTransaction(testUser2Id, txn.id);
      expect(result).toBeNull();
    });
  });

  describe('updateTransaction', () => {
    it('updates transaction for owner', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const result = await updateTransaction(testUser1Id, txn.id, {
        amount: 100,
      });

      expect(result).toBeDefined();
      expect(result?.amount.toString()).toBe('100');
    });

    it('returns null when updating non-owned transaction', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const result = await updateTransaction(testUser2Id, txn.id, {
        amount: 100,
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteTransaction', () => {
    it('deletes transaction for owner', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const deleted = await deleteTransaction(testUser1Id, txn.id);
      expect(deleted).toBe(true);

      const check = await getTransaction(testUser1Id, txn.id);
      expect(check).toBeNull();
    });

    it('returns false when deleting non-owned transaction', async () => {
      const txn = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const deleted = await deleteTransaction(testUser2Id, txn.id);
      expect(deleted).toBe(false);
    });
  });

  describe('bulkReassignCategory', () => {
    it('reassigns category for multiple transactions', async () => {
      const txn1 = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });
      const txn2 = await createTransaction(testUser1Id, {
        amount: 75,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const newCategory = await db.category.create({
        data: {
          userId: testUser1Id,
          name: 'Transport',
          color: '#3b82f6',
          type: 'expense',
        },
      });

      const count = await bulkReassignCategory(testUser1Id, [txn1.id, txn2.id], newCategory.id);
      expect(count).toBe(2);
    });

    it('only reassigns user-owned transactions', async () => {
      const txn1 = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const newCategory = await db.category.create({
        data: {
          userId: testUser1Id,
          name: 'Transport',
          color: '#3b82f6',
          type: 'expense',
        },
      });

      const count = await bulkReassignCategory(testUser2Id, [txn1.id], newCategory.id);
      expect(count).toBe(0);
    });
  });

  describe('bulkDeleteTransactions', () => {
    it('deletes multiple transactions', async () => {
      const txn1 = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });
      const txn2 = await createTransaction(testUser1Id, {
        amount: 75,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const count = await bulkDeleteTransactions(testUser1Id, [txn1.id, txn2.id]);
      expect(count).toBe(2);

      const result = await getTransactions(testUser1Id);
      expect(result.transactions.every((t) => t.id !== txn1.id && t.id !== txn2.id)).toBe(true);
    });

    it('only deletes user-owned transactions', async () => {
      const txn1 = await createTransaction(testUser1Id, {
        amount: 50,
        type: TxnType.expense,
        txnDate: new Date(),
        categoryId,
        accountId,
      });

      const count = await bulkDeleteTransactions(testUser2Id, [txn1.id]);
      expect(count).toBe(0);

      const check = await getTransaction(testUser1Id, txn1.id);
      expect(check).toBeDefined();
    });
  });
});
