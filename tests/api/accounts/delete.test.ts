import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DELETE } from '@/app/api/accounts/[id]/route';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import * as bcrypt from 'bcryptjs';
import { CategoryType, TxnType } from '@prisma/client';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock request helper with URL
function createMockRequest(url: string): Request {
  return {
    url,
  } as unknown as Request;
}

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

describe('DELETE /api/accounts/:id', () => {
  const testEmail = 'account-delete-test@example.com';
  const testPassword = 'SecurePassword123';
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create test user
    testUser = await createTestUser(testEmail, testPassword, 'Test User');

    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  afterEach(async () => {
    await cleanupTestUser(testUser.id);
  });

  describe('Delete account without transactions', () => {
    it('should successfully delete account with no transactions and return 204', async () => {
      // Create an account without any transactions
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Empty Account',
          color: '#ff5733',
        },
      });

      const req = createMockRequest(`http://localhost:3000/api/accounts/${account.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      expect(response.status).toBe(204);

      // Verify account was deleted
      const deletedAccount = await db.account.findUnique({
        where: { id: account.id },
      });
      expect(deletedAccount).toBeNull();
    });
  });

  describe('Delete account with transactions - no reassignTo', () => {
    it('should return 400 with transaction count when account has transactions and no reassignTo', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Account With Txns',
          color: '#ff5733',
        },
      });

      // Create category
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Test Category',
          type: CategoryType.expense,
          color: '#000000',
        },
      });

      // Create transactions
      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: category.id,
            amount: 50,
            type: TxnType.expense,
            txnDate: new Date(),
          },
        ],
      });

      const req = createMockRequest(`http://localhost:3000/api/accounts/${account.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('HAS_TRANSACTIONS');
      expect(data.error.message).toBe('Account has transactions. Provide reassignTo parameter.');
      expect(data.error.details.transactionCount).toBe(2);

      // Verify account was not deleted
      const stillExists = await db.account.findUnique({
        where: { id: account.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Delete account with transactions - with valid reassignTo', () => {
    it('should reassign transactions and delete account when valid reassignTo is provided', async () => {
      // Create source account
      const sourceAccount = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Old Account',
          color: '#ff5733',
        },
      });

      // Create target account
      const targetAccount = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'New Account',
          color: '#00ff00',
        },
      });

      // Create category
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Test Category',
          type: CategoryType.expense,
          color: '#000000',
        },
      });

      // Create transactions
      const txn1 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: sourceAccount.id,
          categoryId: category.id,
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date(),
        },
      });

      const txn2 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: sourceAccount.id,
          categoryId: category.id,
          amount: 50,
          type: TxnType.expense,
          txnDate: new Date(),
        },
      });

      const req = createMockRequest(
        `http://localhost:3000/api/accounts/${sourceAccount.id}?reassignTo=${targetAccount.id}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: sourceAccount.id }),
      });

      expect(response.status).toBe(204);

      // Verify account was deleted
      const deletedAccount = await db.account.findUnique({
        where: { id: sourceAccount.id },
      });
      expect(deletedAccount).toBeNull();

      // Verify transactions were reassigned
      const reassignedTxn1 = await db.transaction.findUnique({
        where: { id: txn1.id },
      });
      const reassignedTxn2 = await db.transaction.findUnique({
        where: { id: txn2.id },
      });

      expect(reassignedTxn1?.accountId).toBe(targetAccount.id);
      expect(reassignedTxn2?.accountId).toBe(targetAccount.id);

      // Verify target account still exists
      const targetStillExists = await db.account.findUnique({
        where: { id: targetAccount.id },
      });
      expect(targetStillExists).not.toBeNull();
    });
  });

  describe('Account not found', () => {
    it('should return 404 when account does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const req = createMockRequest(`http://localhost:3000/api/accounts/${fakeId}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: fakeId }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Account not found');
    });

    it("should return 404 when trying to delete another user's account", async () => {
      // Create another user
      const otherUser = await createTestUser(`other-user-${Date.now()}@example.com`, testPassword);

      // Create account for other user
      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Account',
          color: '#ff5733',
        },
      });

      // Try to delete with current user session
      const req = createMockRequest(`http://localhost:3000/api/accounts/${otherAccount.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: otherAccount.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Account not found');

      // Verify account was not deleted
      const stillExists = await db.account.findUnique({
        where: { id: otherAccount.id },
      });
      expect(stillExists).not.toBeNull();

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Invalid reassignTo parameter', () => {
    it('should return 404 when reassignTo account does not exist', async () => {
      // Create account with transaction
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Account',
          color: '#ff5733',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Test Category',
          type: CategoryType.expense,
          color: '#000000',
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account.id,
          categoryId: category.id,
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date(),
        },
      });

      const fakeReassignId = '00000000-0000-0000-0000-000000000000';
      const req = createMockRequest(
        `http://localhost:3000/api/accounts/${account.id}?reassignTo=${fakeReassignId}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_REASSIGN');
      expect(data.error.message).toBe('Target account not found');

      // Verify account was not deleted
      const stillExists = await db.account.findUnique({
        where: { id: account.id },
      });
      expect(stillExists).not.toBeNull();
    });

    it('should return 404 when reassignTo belongs to another user', async () => {
      // Create another user
      const otherUser = await createTestUser(
        `other-reassign-${Date.now()}@example.com`,
        testPassword
      );

      // Create account for other user
      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
          color: '#00ff00',
        },
      });

      // Create account with transaction for current user
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'My Account',
          color: '#ff5733',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Test Category',
          type: CategoryType.expense,
          color: '#000000',
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account.id,
          categoryId: category.id,
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date(),
        },
      });

      // Try to reassign to other user's account
      const req = createMockRequest(
        `http://localhost:3000/api/accounts/${account.id}?reassignTo=${otherAccount.id}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_REASSIGN');
      expect(data.error.message).toBe('Target account not found');

      // Verify account was not deleted
      const stillExists = await db.account.findUnique({
        where: { id: account.id },
      });
      expect(stillExists).not.toBeNull();

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const fakeId = '00000000-0000-0000-0000-000000000000';
      const req = createMockRequest(`http://localhost:3000/api/accounts/${fakeId}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: fakeId }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple transactions reassignment atomically', async () => {
      // Create source account
      const sourceAccount = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Old Account',
          color: '#ff5733',
        },
      });

      // Create target account
      const targetAccount = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'New Account',
          color: '#00ff00',
        },
      });

      // Create category
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Test Category',
          type: CategoryType.expense,
          color: '#000000',
        },
      });

      // Create multiple transactions
      const transactionIds = [];
      for (let i = 0; i < 10; i++) {
        const txn = await db.transaction.create({
          data: {
            userId: testUser.id,
            accountId: sourceAccount.id,
            categoryId: category.id,
            amount: 100 + i,
            type: TxnType.expense,
            txnDate: new Date(),
          },
        });
        transactionIds.push(txn.id);
      }

      const req = createMockRequest(
        `http://localhost:3000/api/accounts/${sourceAccount.id}?reassignTo=${targetAccount.id}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: sourceAccount.id }),
      });

      expect(response.status).toBe(204);

      // Verify all transactions were reassigned
      const reassignedTxns = await db.transaction.findMany({
        where: { id: { in: transactionIds } },
      });

      expect(reassignedTxns.length).toBe(10);
      reassignedTxns.forEach((txn) => {
        expect(txn.accountId).toBe(targetAccount.id);
      });

      // Verify source account was deleted
      const deletedAccount = await db.account.findUnique({
        where: { id: sourceAccount.id },
      });
      expect(deletedAccount).toBeNull();
    });
  });
});
