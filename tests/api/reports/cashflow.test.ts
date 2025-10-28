import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/reports/cashflow/route';
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
  const url = `http://localhost:3000/api/reports/cashflow${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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

describe('GET /api/reports/cashflow', () => {
  const testEmail = 'cashflow-test@example.com';
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

  describe('Default parameters (AC-4)', () => {
    it('should return 6 months by default when no parameters provided', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.length).toBe(6);

      // Verify each month has the expected structure
      data.data.forEach((month: any) => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('income');
        expect(month).toHaveProperty('expense');
        expect(month).toHaveProperty('net');
        expect(month.month).toMatch(/^\d{4}-\d{2}$/); // YYYY-MM format
      });
    });

    it('should return 6 months of data with zeros when no transactions exist', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(6);

      data.data.forEach((month: any) => {
        expect(month.income).toBe(0);
        expect(month.expense).toBe(0);
        expect(month.net).toBe(0);
      });
    });
  });

  describe('Custom parameters (AC-1)', () => {
    it('should return 6 months when start=2025-06 and months=6', async () => {
      const req = createMockRequest({ start: '2025-06', months: '6' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(6);

      // Verify month range: June to November 2025
      expect(data.data[0].month).toBe('2025-06');
      expect(data.data[1].month).toBe('2025-07');
      expect(data.data[2].month).toBe('2025-08');
      expect(data.data[3].month).toBe('2025-09');
      expect(data.data[4].month).toBe('2025-10');
      expect(data.data[5].month).toBe('2025-11');
    });

    it('should return correct number of months when months parameter is specified', async () => {
      const req = createMockRequest({ months: '3' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(3);
    });

    it('should return 12 months when months=12', async () => {
      const req = createMockRequest({ start: '2024-01', months: '12' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(12);

      // Verify starts at January 2024
      expect(data.data[0].month).toBe('2024-01');
      expect(data.data[11].month).toBe('2024-12');
    });
  });

  describe('Calculation accuracy (AC-2)', () => {
    it('should calculate income, expense, and net correctly for a month', async () => {
      // Create €2000 income in June 2025
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 2000,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-06-15'),
        },
      });

      // Create €1500 expense in June 2025
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1500,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-06-20'),
        },
      });

      const req = createMockRequest({ start: '2025-06', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(1);
      expect(data.data[0].month).toBe('2025-06');
      expect(data.data[0].income).toBe(2000);
      expect(data.data[0].expense).toBe(1500);
      expect(data.data[0].net).toBe(500); // 2000 - 1500
    });

    it('should handle multiple transactions in the same month', async () => {
      // Create multiple income transactions
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1000,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-07-05'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1500,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-07-15'),
        },
      });

      // Create multiple expense transactions
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 300,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-07-10'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 700,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-07-25'),
        },
      });

      const req = createMockRequest({ start: '2025-07', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].income).toBe(2500); // 1000 + 1500
      expect(data.data[0].expense).toBe(1000); // 300 + 700
      expect(data.data[0].net).toBe(1500); // 2500 - 1000
    });

    it('should handle negative net when expenses exceed income', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 500,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-08-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1200,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-08-20'),
        },
      });

      const req = createMockRequest({ start: '2025-08', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].net).toBe(-700); // 500 - 1200
    });
  });

  describe('Empty months (AC-3)', () => {
    it('should return zeros for months with no transactions', async () => {
      // Create transaction only in July 2025
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1000,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-07-15'),
        },
      });

      // Request June, July, August
      const req = createMockRequest({ start: '2025-06', months: '3' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(3);

      // June should be empty
      expect(data.data[0].month).toBe('2025-06');
      expect(data.data[0].income).toBe(0);
      expect(data.data[0].expense).toBe(0);
      expect(data.data[0].net).toBe(0);

      // July should have the transaction
      expect(data.data[1].month).toBe('2025-07');
      expect(data.data[1].income).toBe(1000);

      // August should be empty
      expect(data.data[2].month).toBe('2025-08');
      expect(data.data[2].income).toBe(0);
      expect(data.data[2].expense).toBe(0);
      expect(data.data[2].net).toBe(0);
    });
  });

  describe('Decimal precision', () => {
    it('should format all values to max 2 decimal places', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100.33,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-09-15'),
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
          txnDate: new Date('2025-09-20'),
        },
      });

      const req = createMockRequest({ start: '2025-09', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].income).toBe(100.33);
      expect(data.data[0].expense).toBe(50.67);
      expect(data.data[0].net).toBe(49.66); // 100.33 - 50.67

      // Verify no more than 2 decimal places
      expect(data.data[0].income.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(data.data[0].expense.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(data.data[0].net.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
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

      // Create transaction for other user (larger amount)
      await db.transaction.create({
        data: {
          userId: otherUser.id,
          amount: 5000,
          currency: 'EUR',
          type: 'income',
          categoryId: otherCategory.id,
          accountId: otherAccount.id,
          txnDate: new Date('2025-10-15'),
        },
      });

      const req = createMockRequest({ start: '2025-10', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].income).toBe(100); // Only test user's transaction
      expect(data.data[0].income).not.toBe(5000); // Should not include other user's transaction

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Month boundary handling', () => {
    it('should correctly separate transactions by month boundaries', async () => {
      // Transaction at end of June
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-06-30T23:59:59'),
        },
      });

      // Transaction at start of July
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 200,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-07-01T00:00:00'),
        },
      });

      const req = createMockRequest({ start: '2025-06', months: '2' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].month).toBe('2025-06');
      expect(data.data[0].income).toBe(100); // Only June transaction

      expect(data.data[1].month).toBe('2025-07');
      expect(data.data[1].income).toBe(200); // Only July transaction
    });

    it('should include transactions on first and last day of month', async () => {
      // First day of month
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 100,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-05-01'),
        },
      });

      // Last day of month (May has 31 days)
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 200,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-05-31'),
        },
      });

      const req = createMockRequest({ start: '2025-05', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].income).toBe(300); // Both transactions included
    });
  });

  describe('Only income or only expense', () => {
    it('should handle months with only income transactions', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 1500,
          currency: 'EUR',
          type: 'income',
          categoryId: testIncomeCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-04-15'),
        },
      });

      const req = createMockRequest({ start: '2025-04', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].income).toBe(1500);
      expect(data.data[0].expense).toBe(0);
      expect(data.data[0].net).toBe(1500);
    });

    it('should handle months with only expense transactions', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          amount: 800,
          currency: 'EUR',
          type: 'expense',
          categoryId: testExpenseCategory.id,
          accountId: testAccount.id,
          txnDate: new Date('2025-03-15'),
        },
      });

      const req = createMockRequest({ start: '2025-03', months: '1' });
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].income).toBe(0);
      expect(data.data[0].expense).toBe(800);
      expect(data.data[0].net).toBe(-800);
    });
  });
});
