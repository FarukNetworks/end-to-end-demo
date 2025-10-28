import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/reports/summary/route';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import * as bcrypt from 'bcryptjs';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock request helper
function createMockRequest(queryParams: Record<string, string> = {}): Request {
  const searchParams = new URLSearchParams(queryParams);
  const url = `http://localhost:3000/api/reports/summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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

describe('GET /api/reports/summary', () => {
  const testEmail = 'summary-test@example.com';
  const testPassword = 'SecurePassword123';
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testIncomeCategory: Awaited<ReturnType<typeof db.category.create>>;
  let testExpenseCategory: Awaited<ReturnType<typeof db.category.create>>;
  let testAccount: Awaited<ReturnType<typeof db.account.create>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create test user
    testUser = await createTestUser(testEmail, testPassword, 'Test User');

    // Create test categories
    testIncomeCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Salary',
        type: 'income',
        color: '#00ff00',
      },
    });

    testExpenseCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Groceries',
        type: 'expense',
        color: '#ff0000',
      },
    });

    // Create test account
    testAccount = await db.account.create({
      data: {
        userId: testUser.id,
        name: 'Test Account',
        color: '#0000ff',
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

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required');
    });
  });

  describe('All-time totals (no date params)', () => {
    it('should return all-time totals when no date parameters provided', async () => {
      // Create 3 income transactions (€1000 each)
      for (let i = 0; i < 3; i++) {
        await db.transaction.create({
          data: {
            userId: testUser.id,
            amount: 1000,
            currency: 'EUR',
            type: 'income',
            categoryId: testIncomeCategory.id,
            accountId: testAccount.id,
            txnDate: new Date('2025-01-15'),
          },
        });
      }

      // Create 5 expense transactions (€200 each)
      for (let i = 0; i < 5; i++) {
        await db.transaction.create({
          data: {
            userId: testUser.id,
            amount: 200,
            currency: 'EUR',
            type: 'expense',
            categoryId: testExpenseCategory.id,
            accountId: testAccount.id,
            txnDate: new Date('2025-01-20'),
          },
        });
      }

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(3000);
      expect(data.totalExpense).toBe(1000);
      expect(data.net).toBe(2000);
      expect(data.transactionCount).toBe(8);
    });

    it('should return zero values when user has no transactions', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(0);
      expect(data.totalExpense).toBe(0);
      expect(data.net).toBe(0);
      expect(data.transactionCount).toBe(0);
    });
  });

  describe('Date range filtering', () => {
    it('should filter transactions by date range (from and to)', async () => {
      // Create transactions in October 2025
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 500,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 200,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-20'),
        },
      });

      // Create transaction outside date range
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1000,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-09-15'),
        },
      });

      const req = createMockRequest({
        from: '2025-10-01',
        to: '2025-10-31',
      });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(500);
      expect(data.totalExpense).toBe(200);
      expect(data.net).toBe(300);
      expect(data.transactionCount).toBe(2);
    });

    it('should filter transactions from a specific date onwards (from only)', async () => {
      // Create transactions before cutoff
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-09-30'),
        },
      });

      // Create transactions after cutoff
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 300,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-01'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 150,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest({
        from: '2025-10-01',
      });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(300);
      expect(data.totalExpense).toBe(150);
      expect(data.net).toBe(150);
      expect(data.transactionCount).toBe(2);
    });

    it('should filter transactions up to a specific date (to only)', async () => {
      // Create transactions before cutoff
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 400,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-09-30'),
        },
      });

      // Create transactions after cutoff
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 500,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest({
        to: '2025-09-30',
      });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(400);
      expect(data.totalExpense).toBe(0);
      expect(data.net).toBe(400);
      expect(data.transactionCount).toBe(1);
    });
  });

  describe('Decimal precision', () => {
    it('should format all values to max 2 decimal places', async () => {
      // Create transactions that will result in decimal precision test
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100.33,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 50.67,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(100.33);
      expect(data.totalExpense).toBe(50.67);
      expect(data.net).toBe(49.66);

      // Verify no more than 2 decimal places
      expect(data.totalIncome.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(data.totalExpense.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(data.net.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });

    it('should handle values that round to whole numbers', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100.0,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(100);
      expect(data.net).toBe(100);
    });
  });

  describe('User scoping', () => {
    it('should only return transactions for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUser('other@example.com', testPassword);

      // Create category and account for other user
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: 'income',
        },
      });

      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
        },
      });

      // Create transaction for test user
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      // Create transaction for other user
      await db.transaction.create({
        data: {
          userId: otherUser.id,
          amount: 500,
          currency: 'EUR',
          type: 'income',
          categoryId: otherCategory.id,
          accountId: otherAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(100); // Only test user's transaction
      expect(data.transactionCount).toBe(1);

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Calculation accuracy', () => {
    it('should correctly calculate summary with mixed income and expense (AC-2)', async () => {
      // Create 3 income transactions (€1000 each)
      for (let i = 0; i < 3; i++) {
        await db.transaction.create({
          data: {
            userId: testUser.id,
            amount: 1000,
            currency: 'EUR',
            type: 'income',
            categoryId: testIncomeCategory.id,
            accountId: testAccount.id,
            txnDate: new Date('2025-10-15'),
          },
        });
      }

      // Create 5 expense transactions (€200 each)
      for (let i = 0; i < 5; i++) {
        await db.transaction.create({
          data: {
            userId: testUser.id,
            amount: 200,
            currency: 'EUR',
            type: 'expense',
            categoryId: testExpenseCategory.id,
            accountId: testAccount.id,
            txnDate: new Date('2025-10-20'),
          },
        });
      }

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(3000);
      expect(data.totalExpense).toBe(1000);
      expect(data.net).toBe(2000);
      expect(data.transactionCount).toBe(8);
    });

    it('should handle negative net (expenses > income)', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 500,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(100);
      expect(data.totalExpense).toBe(500);
      expect(data.net).toBe(-400);
    });

    it('should handle only income transactions', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1500,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(1500);
      expect(data.totalExpense).toBe(0);
      expect(data.net).toBe(1500);
      expect(data.transactionCount).toBe(1);
    });

    it('should handle only expense transactions', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 250,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalIncome).toBe(0);
      expect(data.totalExpense).toBe(250);
      expect(data.net).toBe(-250);
      expect(data.transactionCount).toBe(1);
    });
  });
});
