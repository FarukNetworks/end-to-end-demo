import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DELETE } from '@/app/api/categories/[id]/route';
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

describe('DELETE /api/categories/:id', () => {
  const testEmail = 'category-delete-test@example.com';
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

  describe('Delete category without transactions', () => {
    it('should successfully delete category with no transactions and return 204', async () => {
      // Create a category without any transactions
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Empty Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      const req = createMockRequest(`http://localhost:3000/api/categories/${category.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: category.id }),
      });

      expect(response.status).toBe(204);

      // Verify category was deleted
      const deletedCategory = await db.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();
    });
  });

  describe('Delete category with transactions - no reassignTo', () => {
    it('should return 400 with transaction count when category has transactions and no reassignTo', async () => {
      // Create category
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Category With Txns',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
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

      const req = createMockRequest(`http://localhost:3000/api/categories/${category.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: category.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('HAS_TRANSACTIONS');
      expect(data.error.message).toBe('Category has transactions. Provide reassignTo parameter.');
      expect(data.error.details.transactionCount).toBe(2);

      // Verify category was not deleted
      const stillExists = await db.category.findUnique({
        where: { id: category.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Delete category with transactions - with valid reassignTo', () => {
    it('should reassign transactions and delete category when valid reassignTo is provided', async () => {
      // Create source category
      const sourceCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Old Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      // Create target category
      const targetCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'New Category',
          type: CategoryType.expense,
          color: '#00ff00',
          isSystem: false,
        },
      });

      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#000000',
        },
      });

      // Create transactions
      const txn1 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account.id,
          categoryId: sourceCategory.id,
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date(),
        },
      });

      const txn2 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account.id,
          categoryId: sourceCategory.id,
          amount: 50,
          type: TxnType.expense,
          txnDate: new Date(),
        },
      });

      const req = createMockRequest(
        `http://localhost:3000/api/categories/${sourceCategory.id}?reassignTo=${targetCategory.id}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: sourceCategory.id }),
      });

      expect(response.status).toBe(204);

      // Verify category was deleted
      const deletedCategory = await db.category.findUnique({
        where: { id: sourceCategory.id },
      });
      expect(deletedCategory).toBeNull();

      // Verify transactions were reassigned
      const reassignedTxn1 = await db.transaction.findUnique({
        where: { id: txn1.id },
      });
      const reassignedTxn2 = await db.transaction.findUnique({
        where: { id: txn2.id },
      });

      expect(reassignedTxn1?.categoryId).toBe(targetCategory.id);
      expect(reassignedTxn2?.categoryId).toBe(targetCategory.id);

      // Verify target category still exists
      const targetStillExists = await db.category.findUnique({
        where: { id: targetCategory.id },
      });
      expect(targetStillExists).not.toBeNull();
    });
  });

  describe('System category protection', () => {
    it('should return 400 when attempting to delete system category', async () => {
      // Create a system category
      const systemCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'System Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: true,
        },
      });

      const req = createMockRequest(`http://localhost:3000/api/categories/${systemCategory.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: systemCategory.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('SYSTEM_CATEGORY');
      expect(data.error.message).toBe('Cannot delete system category');

      // Verify category was not deleted
      const stillExists = await db.category.findUnique({
        where: { id: systemCategory.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Category not found', () => {
    it('should return 404 when category does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const req = createMockRequest(`http://localhost:3000/api/categories/${fakeId}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: fakeId }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Category not found');
    });

    it("should return 404 when trying to delete another user's category", async () => {
      // Create another user
      const otherUser = await createTestUser(`other-user-${Date.now()}@example.com`, testPassword);

      // Create category for other user
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      // Try to delete with current user session
      const req = createMockRequest(`http://localhost:3000/api/categories/${otherCategory.id}`);
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: otherCategory.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Category not found');

      // Verify category was not deleted
      const stillExists = await db.category.findUnique({
        where: { id: otherCategory.id },
      });
      expect(stillExists).not.toBeNull();

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Invalid reassignTo parameter', () => {
    it('should return 404 when reassignTo category does not exist', async () => {
      // Create category with transaction
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
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
        `http://localhost:3000/api/categories/${category.id}?reassignTo=${fakeReassignId}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: category.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_REASSIGN');
      expect(data.error.message).toBe('Target category not found');

      // Verify category was not deleted
      const stillExists = await db.category.findUnique({
        where: { id: category.id },
      });
      expect(stillExists).not.toBeNull();
    });

    it('should return 404 when reassignTo belongs to another user', async () => {
      // Create another user
      const otherUser = await createTestUser(
        `other-reassign-${Date.now()}@example.com`,
        testPassword
      );

      // Create category for other user
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: CategoryType.expense,
          color: '#00ff00',
          isSystem: false,
        },
      });

      // Create category with transaction for current user
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'My Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
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

      // Try to reassign to other user's category
      const req = createMockRequest(
        `http://localhost:3000/api/categories/${category.id}?reassignTo=${otherCategory.id}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: category.id }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_REASSIGN');
      expect(data.error.message).toBe('Target category not found');

      // Verify category was not deleted
      const stillExists = await db.category.findUnique({
        where: { id: category.id },
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
      const req = createMockRequest(`http://localhost:3000/api/categories/${fakeId}`);
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
      // Create source category
      const sourceCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Old Category',
          type: CategoryType.expense,
          color: '#ff5733',
          isSystem: false,
        },
      });

      // Create target category
      const targetCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'New Category',
          type: CategoryType.expense,
          color: '#00ff00',
          isSystem: false,
        },
      });

      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#000000',
        },
      });

      // Create multiple transactions
      const transactionIds = [];
      for (let i = 0; i < 10; i++) {
        const txn = await db.transaction.create({
          data: {
            userId: testUser.id,
            accountId: account.id,
            categoryId: sourceCategory.id,
            amount: 100 + i,
            type: TxnType.expense,
            txnDate: new Date(),
          },
        });
        transactionIds.push(txn.id);
      }

      const req = createMockRequest(
        `http://localhost:3000/api/categories/${sourceCategory.id}?reassignTo=${targetCategory.id}`
      );
      const response = await DELETE(req as any, {
        params: Promise.resolve({ id: sourceCategory.id }),
      });

      expect(response.status).toBe(204);

      // Verify all transactions were reassigned
      const reassignedTxns = await db.transaction.findMany({
        where: { id: { in: transactionIds } },
      });

      expect(reassignedTxns.length).toBe(10);
      reassignedTxns.forEach((txn) => {
        expect(txn.categoryId).toBe(targetCategory.id);
      });

      // Verify source category was deleted
      const deletedCategory = await db.category.findUnique({
        where: { id: sourceCategory.id },
      });
      expect(deletedCategory).toBeNull();
    });
  });
});
