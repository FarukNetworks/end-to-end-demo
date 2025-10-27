import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/categories/route';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import * as bcrypt from 'bcryptjs';
import { CategoryType } from '@prisma/client';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock request helper
function createMockRequest(): Request {
  return {
    url: 'http://localhost:3000/api/categories',
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

describe('GET /api/categories', () => {
  const testEmail = 'categories-test@example.com';
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

  describe('Successful category retrieval', () => {
    it('should return all user categories with transaction counts', async () => {
      // Create test categories
      const expenseCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: CategoryType.expense,
          color: '#10b981',
          isSystem: true,
        },
      });

      const incomeCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Salary',
          type: CategoryType.income,
          color: '#22c55e',
          isSystem: true,
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveLength(2);
      expect(data.data[0]._count).toBeDefined();
      expect(data.data[0]._count.txns).toBe(0);
    });

    it('should order categories by type (expense first) then name', async () => {
      // Create categories in random order
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Salary',
          type: CategoryType.income,
          color: '#22c55e',
        },
      });

      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Transport',
          type: CategoryType.expense,
          color: '#3b82f6',
        },
      });

      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: CategoryType.expense,
          color: '#10b981',
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);

      // First two should be expense (alphabetically)
      expect(data.data[0].type).toBe('expense');
      expect(data.data[0].name).toBe('Groceries');
      expect(data.data[1].type).toBe('expense');
      expect(data.data[1].name).toBe('Transport');

      // Last should be income
      expect(data.data[2].type).toBe('income');
      expect(data.data[2].name).toBe('Salary');
    });

    it('should include correct transaction count', async () => {
      // Create category and account
      const category = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: CategoryType.expense,
          color: '#10b981',
        },
      });

      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
        },
      });

      // Create 3 transactions
      await db.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            categoryId: category.id,
            accountId: account.id,
            amount: 100,
            type: 'expense',
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            categoryId: category.id,
            accountId: account.id,
            amount: 50,
            type: 'expense',
            txnDate: new Date(),
          },
          {
            userId: testUser.id,
            categoryId: category.id,
            accountId: account.id,
            amount: 75,
            type: 'expense',
            txnDate: new Date(),
          },
        ],
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]._count.txns).toBe(3);
    });

    it('should return both system and custom categories', async () => {
      // Create system category
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: CategoryType.expense,
          color: '#10b981',
          isSystem: true,
        },
      });

      // Create custom category
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Custom Category',
          type: CategoryType.expense,
          color: '#ff0000',
          isSystem: false,
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);

      const systemCategory = data.data.find((c: any) => c.isSystem);
      const customCategory = data.data.find((c: any) => !c.isSystem);

      expect(systemCategory).toBeDefined();
      expect(customCategory).toBeDefined();
    });

    it('should return empty array when user has no categories', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });
  });

  describe('User scoping', () => {
    it('should only return categories belonging to authenticated user', async () => {
      // Create category for test user
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'My Category',
          type: CategoryType.expense,
          color: '#10b981',
        },
      });

      // Create another user with category
      const otherUser = await createTestUser('other@example.com', testPassword);
      await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: CategoryType.expense,
          color: '#ff0000',
        },
      });

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('My Category');
      expect(data.data[0].userId).toBe(testUser.id);

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
