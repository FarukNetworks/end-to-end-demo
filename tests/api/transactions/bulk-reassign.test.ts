import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/transactions/bulk/reassign/route';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import * as bcrypt from 'bcryptjs';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock request helper
function createMockRequest(body: unknown): Request {
  return {
    json: async () => body,
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

describe('POST /api/transactions/bulk/reassign', () => {
  const testEmail = 'bulk-reassign-test@example.com';
  const testPassword = 'SecurePassword123';
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let expenseCategory1: Awaited<ReturnType<typeof db.category.create>>;
  let expenseCategory2: Awaited<ReturnType<typeof db.category.create>>;
  let incomeCategory: Awaited<ReturnType<typeof db.category.create>>;
  let testAccount: Awaited<ReturnType<typeof db.account.create>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create test user
    testUser = await createTestUser(testEmail, testPassword, 'Test User');

    // Create test categories
    expenseCategory1 = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Food',
        type: 'expense',
        color: '#ff0000',
      },
    });

    expenseCategory2 = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Transport',
        type: 'expense',
        color: '#00ff00',
      },
    });

    incomeCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Salary',
        type: 'income',
        color: '#0000ff',
      },
    });

    // Create test account
    testAccount = await db.account.create({
      data: {
        userId: testUser.id,
        name: 'Test Account',
        color: '#00ff00',
      },
    });

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

  describe('Successful bulk reassignment', () => {
    it('should reassign multiple transactions to new category and return count', async () => {
      // Create test transactions
      const txn1 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 50.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      const txn2 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 100.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-16'),
        },
      });

      const txn3 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 75.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-17'),
        },
      });

      const req = createMockRequest({
        ids: [txn1.id, txn2.id, txn3.id],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(3);
      expect(data.message).toBe('3 transaction(s) reassigned');

      // Verify transactions were updated
      const updatedTxns = await db.transaction.findMany({
        where: { id: { in: [txn1.id, txn2.id, txn3.id] } },
      });

      expect(updatedTxns.every((t) => t.categoryId === expenseCategory2.id)).toBe(true);
    });

    it('should reassign single transaction', async () => {
      const txn = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 50.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      const req = createMockRequest({
        ids: [txn.id],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(1);
      expect(data.message).toBe('1 transaction(s) reassigned');
    });

    it('should handle income transactions reassignment', async () => {
      // Create income category
      const incomeCategory2 = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Bonus',
          type: 'income',
          color: '#00aa00',
        },
      });

      const txn1 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: incomeCategory.id,
          amount: 5000.0,
          currency: 'EUR',
          type: 'income',
          txnDate: new Date('2024-01-01'),
        },
      });

      const txn2 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: incomeCategory.id,
          amount: 3000.0,
          currency: 'EUR',
          type: 'income',
          txnDate: new Date('2024-02-01'),
        },
      });

      const req = createMockRequest({
        ids: [txn1.id, txn2.id],
        categoryId: incomeCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(2);
    });
  });

  describe('User scoping', () => {
    it('should only reassign current user transactions, ignoring others', async () => {
      // Create another user and their transactions
      const otherUser = await createTestUser('other@example.com', testPassword);
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: 'expense',
        },
      });
      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
        },
      });

      const otherTxn = await db.transaction.create({
        data: {
          userId: otherUser.id,
          accountId: otherAccount.id,
          categoryId: otherCategory.id,
          amount: 999.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      // Create current user transaction
      const myTxn = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 50.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      // Try to reassign both (should only update current user's)
      const req = createMockRequest({
        ids: [myTxn.id, otherTxn.id],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(1); // Only current user's transaction

      // Verify other user's transaction unchanged
      const otherTxnAfter = await db.transaction.findUnique({
        where: { id: otherTxn.id },
      });
      expect(otherTxnAfter?.categoryId).toBe(otherCategory.id);

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = createMockRequest({
        ids: ['00000000-0000-0000-0000-000000000001'],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required');
    });
  });

  describe('Category ownership validation', () => {
    it('should return 404 when category does not exist', async () => {
      const req = createMockRequest({
        ids: ['12345678-1234-1234-8234-123456789001'],
        categoryId: '12345678-1234-1234-8234-123456789000',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_CATEGORY');
      expect(data.error.message).toBe('Category not found');
    });

    it('should return 404 when category belongs to different user', async () => {
      // Create another user and their category
      const otherUser = await createTestUser(`other-${Date.now()}@example.com`, testPassword);
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: 'expense',
        },
      });

      const req = createMockRequest({
        ids: ['12345678-1234-1234-8234-123456789001'],
        categoryId: otherCategory.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_CATEGORY');

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });

    it('should return 400 for invalid category UUID format', async () => {
      const req = createMockRequest({
        ids: ['12345678-1234-1234-8234-123456789001'],
        categoryId: 'not-a-uuid',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid category ID');
    });
  });

  describe('Type compatibility validation', () => {
    it('should return 400 when transaction types do not match category type', async () => {
      // Create expense transaction
      const expenseTxn = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 50.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      // Try to reassign to income category
      const req = createMockRequest({
        ids: [expenseTxn.id],
        categoryId: incomeCategory.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('TYPE_MISMATCH');
      expect(data.error.message).toContain('income');
      expect(data.error.message).toContain(expenseTxn.id);
    });

    it('should return 400 when any transaction in batch has mismatched type', async () => {
      // Create expense transactions
      const expenseTxn1 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 50.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      const expenseTxn2 = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: expenseCategory1.id,
          amount: 75.0,
          currency: 'EUR',
          type: 'expense',
          txnDate: new Date('2024-01-16'),
        },
      });

      // Create income transaction
      const incomeTxn = await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: incomeCategory.id,
          amount: 5000.0,
          currency: 'EUR',
          type: 'income',
          txnDate: new Date('2024-01-01'),
        },
      });

      // Try to reassign all to expense category (income one will fail)
      const req = createMockRequest({
        ids: [expenseTxn1.id, expenseTxn2.id, incomeTxn.id],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('TYPE_MISMATCH');
      expect(data.error.message).toContain('expense');
      expect(data.error.message).toContain(incomeTxn.id);

      // Verify no transactions were updated
      const txnsAfter = await db.transaction.findMany({
        where: { id: { in: [expenseTxn1.id, expenseTxn2.id, incomeTxn.id] } },
      });
      expect(txnsAfter.find((t) => t.id === expenseTxn1.id)?.categoryId).toBe(expenseCategory1.id);
      expect(txnsAfter.find((t) => t.id === expenseTxn2.id)?.categoryId).toBe(expenseCategory1.id);
      expect(txnsAfter.find((t) => t.id === incomeTxn.id)?.categoryId).toBe(incomeCategory.id);
    });
  });

  describe('IDs array validation', () => {
    it('should return 400 for empty IDs array', async () => {
      const req = createMockRequest({
        ids: [],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('At least one transaction ID required');
    });

    it('should return 400 for more than 100 IDs', async () => {
      const tooManyIds = Array(101)
        .fill(0)
        .map((_, i) => `12345678-1234-1234-8234-${String(i).padStart(12, '0')}`);

      const req = createMockRequest({
        ids: tooManyIds,
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Maximum 100 transactions per request');
    });

    it('should accept exactly 100 IDs', async () => {
      // Create 100 transactions
      const transactions = await Promise.all(
        Array(100)
          .fill(0)
          .map(async () =>
            db.transaction.create({
              data: {
                userId: testUser.id,
                accountId: testAccount.id,
                categoryId: expenseCategory1.id,
                amount: 10.0,
                currency: 'EUR',
                type: 'expense',
                txnDate: new Date('2024-01-15'),
              },
            })
          )
      );

      const ids = transactions.map((t) => t.id);

      const req = createMockRequest({
        ids,
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(100);
    });

    it('should return 400 for invalid UUID in IDs array', async () => {
      const req = createMockRequest({
        ids: ['not-a-uuid', '00000000-0000-0000-0000-000000000001'],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid transaction ID');
    });

    it('should return 0 updated when all IDs are non-existent', async () => {
      const req = createMockRequest({
        ids: ['12345678-1234-1234-8234-123456789001', '12345678-1234-1234-8234-123456789002'],
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(0);
      expect(data.message).toBe('0 transaction(s) reassigned');
    });
  });

  describe('Required fields validation', () => {
    it('should return 400 when ids is missing', async () => {
      const req = createMockRequest({
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when categoryId is missing', async () => {
      const req = createMockRequest({
        ids: ['12345678-1234-1234-8234-123456789001'],
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when ids is not an array', async () => {
      const req = createMockRequest({
        ids: '12345678-1234-1234-8234-123456789001',
        categoryId: expenseCategory2.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
