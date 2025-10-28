import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/accounts/route';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import * as bcrypt from 'bcryptjs';
import { TxnType } from '@prisma/client';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock request helper
function createMockRequest(): Request {
  return {
    url: 'http://localhost:3000/api/accounts',
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

describe('GET /api/accounts', () => {
  const testEmail = 'accounts-test@example.com';
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

  describe('Successful account retrieval', () => {
    it('should return all user accounts with calculated balances', async () => {
      // Create test account
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking Account',
          color: '#3b82f6',
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].balance).toBeDefined();
      expect(data.data[0].balance).toBe(0);
      expect(data.data[0]._count).toBeDefined();
      expect(data.data[0]._count.txns).toBe(0);
    });

    it('should calculate balance correctly with income and expense transactions', async () => {
      // Create account and category
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking Account',
          color: '#3b82f6',
        },
      });

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

      // Create 2 income transactions (€100 each) and 1 expense (€50)
      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: incomeCategory.id,
            amount: 100,
            type: TxnType.income,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: incomeCategory.id,
            amount: 100,
            type: TxnType.income,
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            accountId: account.id,
            categoryId: expenseCategory.id,
            amount: 50,
            type: TxnType.expense,
            txnDate: new Date(),
          },
        ],
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      // Balance should be: 100 + 100 - 50 = 150
      expect(data.data[0].balance).toBe(150);
      expect(data.data[0]._count.txns).toBe(3);
    });

    it('should return zero balance for account with no transactions', async () => {
      // Create account with no transactions
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Savings Account',
          color: '#22c55e',
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].balance).toBe(0);
      expect(data.data[0]._count.txns).toBe(0);
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

      // Small delay to ensure different timestamps
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

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);

      // Verify order by createdAt ascending
      expect(data.data[0].id).toBe(account1.id);
      expect(data.data[0].name).toBe('First Account');
      expect(data.data[1].id).toBe(account2.id);
      expect(data.data[1].name).toBe('Second Account');
      expect(data.data[2].id).toBe(account3.id);
      expect(data.data[2].name).toBe('Third Account');
    });

    it('should include transaction count for each account', async () => {
      // Create account and category
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking Account',
          color: '#3b82f6',
        },
      });

      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: 'expense',
          color: '#ef4444',
        },
      });

      // Create 5 transactions
      await db.transaction.createMany({
        data: Array.from({ length: 5 }, () => ({
          userId: testUser.id,
          accountId: account.id,
          categoryId: category.id,
          amount: 50,
          type: TxnType.expense,
          txnDate: new Date(),
        })),
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]._count).toBeDefined();
      expect(data.data[0]._count.txns).toBe(5);
    });

    it('should return empty array when user has no accounts', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });

    it('should calculate separate balances for multiple accounts', async () => {
      // Create accounts
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
          name: 'General',
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

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: account2.id,
          categoryId: category.id,
          amount: 200,
          type: TxnType.income,
          txnDate: new Date(),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);

      const checking = data.data.find((a: any) => a.name === 'Checking');
      const savings = data.data.find((a: any) => a.name === 'Savings');

      expect(checking.balance).toBe(100);
      expect(savings.balance).toBe(200);
    });
  });

  describe('User scoping', () => {
    it('should only return accounts belonging to authenticated user', async () => {
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

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('My Account');
      expect(data.data[0].userId).toBe(testUser.id);

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });

    it('should only include transactions from user-owned accounts in balance calculation', async () => {
      // Create account and category for test user
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'My Account',
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

      // Add transaction to test user account
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

      // Create other user with transaction (should not affect balance)
      const otherUser = await createTestUser('other@example.com', testPassword);
      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
          color: '#ef4444',
        },
      });

      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Income',
          type: 'income',
          color: '#22c55e',
        },
      });

      await db.transaction.create({
        data: {
          userId: otherUser.id,
          accountId: otherAccount.id,
          categoryId: otherCategory.id,
          amount: 500,
          type: TxnType.income,
          txnDate: new Date(),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].balance).toBe(100); // Only test user's transactions

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
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
});
