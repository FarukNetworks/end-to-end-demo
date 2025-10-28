import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/reports/by-category/route';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import * as bcrypt from 'bcryptjs';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock request helper
function createMockRequest(searchParams: Record<string, string> = {}): Request {
  const params = new URLSearchParams(searchParams);
  const url = `http://localhost:3000/api/reports/by-category?${params.toString()}`;
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

describe('GET /api/reports/by-category', () => {
  const testEmail = 'report-test@example.com';
  const testPassword = 'SecurePassword123';
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testAccount: Awaited<ReturnType<typeof db.account.create>>;
  let groceriesCategory: Awaited<ReturnType<typeof db.category.create>>;
  let transportCategory: Awaited<ReturnType<typeof db.category.create>>;
  let salaryCategory: Awaited<ReturnType<typeof db.category.create>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create test user
    testUser = await createTestUser(testEmail, testPassword, 'Test User');

    // Create test account
    testAccount = await db.account.create({
      data: {
        userId: testUser.id,
        name: 'Test Account',
        color: '#00ff00',
      },
    });

    // Create test categories
    groceriesCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Groceries',
        type: 'expense',
        color: '#ff0000',
      },
    });

    transportCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Transport',
        type: 'expense',
        color: '#00ff00',
      },
    });

    salaryCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Salary',
        type: 'income',
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

  describe('Successful breakdown with percentages', () => {
    it('should return breakdown with totals and percentages', async () => {
      // Create transactions: €400 Groceries, €600 Transport (total €1000)
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 400,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 600,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(1000);

      // Groceries: €400 = 40%
      const groceries = result.data.find((item: any) => item.categoryId === groceriesCategory.id);
      expect(groceries.categoryName).toBe('Groceries');
      expect(groceries.categoryColor).toBe('#ff0000');
      expect(groceries.total).toBe(400);
      expect(groceries.percentage).toBe(40);

      // Transport: €600 = 60%
      const transport = result.data.find((item: any) => item.categoryId === transportCategory.id);
      expect(transport.categoryName).toBe('Transport');
      expect(transport.categoryColor).toBe('#00ff00');
      expect(transport.total).toBe(600);
      expect(transport.percentage).toBe(60);
    });

    it('should handle multiple transactions in same category', async () => {
      // Create 3 transactions in Groceries: €100 + €200 + €100 = €400
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-10'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 200,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(400);
      expect(result.data[0].total).toBe(400);
      expect(result.data[0].percentage).toBe(100);
    });

    it('should handle decimal amounts correctly', async () => {
      // Create transactions with decimal amounts
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 123.45,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 76.55,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.total).toBe(200);

      const groceries = result.data.find((item: any) => item.categoryId === groceriesCategory.id);
      expect(groceries.total).toBe(123.45);
      expect(groceries.percentage).toBe(61.7); // 123.45/200 * 100 = 61.725 -> 61.7

      const transport = result.data.find((item: any) => item.categoryId === transportCategory.id);
      expect(transport.total).toBe(76.55);
      expect(transport.percentage).toBe(38.3); // 76.55/200 * 100 = 38.275 -> 38.3
    });
  });

  describe('Sort order verification', () => {
    it('should sort categories by total descending', async () => {
      // Create transactions with different totals
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 500,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);

      // First should be Transport (€500)
      expect(result.data[0].categoryId).toBe(transportCategory.id);
      expect(result.data[0].total).toBe(500);

      // Second should be Groceries (€100)
      expect(result.data[1].categoryId).toBe(groceriesCategory.id);
      expect(result.data[1].total).toBe(100);
    });
  });

  describe('Date range filtering', () => {
    it('should filter by from date', async () => {
      // Create transactions on different dates
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-10'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 200,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      // Filter from 2024-01-15 (should only get Transport)
      const req = createMockRequest({ from: '2024-01-15' });
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(200);
      expect(result.data[0].categoryId).toBe(transportCategory.id);
    });

    it('should filter by to date', async () => {
      // Create transactions on different dates
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-10'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 200,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      // Filter to 2024-01-15 (should only get Groceries)
      const req = createMockRequest({ to: '2024-01-15' });
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(100);
      expect(result.data[0].categoryId).toBe(groceriesCategory.id);
    });

    it('should filter by date range (from and to)', async () => {
      // Create transactions on different dates
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-05'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 200,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 300,
          type: 'expense',
          txnDate: new Date('2024-01-25'),
        },
      });

      // Filter from 2024-01-10 to 2024-01-20 (should only get Transport)
      const req = createMockRequest({ from: '2024-01-10', to: '2024-01-20' });
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(200);
      expect(result.data[0].categoryId).toBe(transportCategory.id);
    });
  });

  describe('Type filtering', () => {
    it('should filter by expense type', async () => {
      // Create expense and income transactions
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 400,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: salaryCategory.id,
          amount: 5000,
          type: 'income',
          txnDate: new Date('2024-01-01'),
        },
      });

      // Filter by expense type
      const req = createMockRequest({ type: 'expense' });
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(400);
      expect(result.data[0].categoryId).toBe(groceriesCategory.id);
    });

    it('should filter by income type', async () => {
      // Create expense and income transactions
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 400,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: salaryCategory.id,
          amount: 5000,
          type: 'income',
          txnDate: new Date('2024-01-01'),
        },
      });

      // Filter by income type
      const req = createMockRequest({ type: 'income' });
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(5000);
      expect(result.data[0].categoryId).toBe(salaryCategory.id);
    });

    it('should return 400 for invalid type parameter', async () => {
      const req = createMockRequest({ type: 'invalid_type' });
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Type must be expense or income');
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('UNAUTHORIZED');
      expect(result.error.message).toBe('Authentication required');
    });
  });

  describe('Edge cases', () => {
    it('should return empty array when no transactions exist', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return data for single category', async () => {
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 500,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(500);
      expect(result.data[0].percentage).toBe(100);
    });

    it('should not include other users transactions', async () => {
      // Create another user
      const otherUser = await createTestUser('other@example.com', testPassword);
      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
        },
      });
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: 'expense',
        },
      });

      // Create transaction for other user
      await db.transaction.create({
        data: {
          userId: otherUser.id,
          accountId: otherAccount.id,
          categoryId: otherCategory.id,
          amount: 999,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      // Create transaction for test user
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 100,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(100);
      expect(result.data[0].categoryId).toBe(groceriesCategory.id);

      // Cleanup other user
      await cleanupTestUser(otherUser.id);
    });

    it('should handle percentage calculation with very small amounts', async () => {
      // Create transactions with very small amounts
      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: groceriesCategory.id,
          amount: 0.01,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
        },
      });

      await db.transaction.create({
        data: {
          userId: testUser.id,
          accountId: testAccount.id,
          categoryId: transportCategory.id,
          amount: 0.02,
          type: 'expense',
          txnDate: new Date('2024-01-20'),
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.total).toBe(0.03);

      const groceries = result.data.find((item: any) => item.categoryId === groceriesCategory.id);
      expect(groceries.percentage).toBe(33.3); // 0.01/0.03 * 100 = 33.333... -> 33.3

      const transport = result.data.find((item: any) => item.categoryId === transportCategory.id);
      expect(transport.percentage).toBe(66.7); // 0.02/0.03 * 100 = 66.666... -> 66.7
    });
  });
});
