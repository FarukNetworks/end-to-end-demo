import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/transactions/route';
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

describe('POST /api/transactions', () => {
  const testEmail = 'transaction-test@example.com';
  const testPassword = 'SecurePassword123';
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testCategory: Awaited<ReturnType<typeof db.category.create>>;
  let testAccount: Awaited<ReturnType<typeof db.account.create>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create test user
    testUser = await createTestUser(testEmail, testPassword, 'Test User');

    // Create test category (expense)
    testCategory = await db.category.create({
      data: {
        userId: testUser.id,
        name: 'Test Category',
        type: 'expense',
        color: '#ff0000',
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

  describe('Successful transaction creation', () => {
    it('should create transaction with valid data and return 201', async () => {
      const req = createMockRequest({
        amount: 100.5,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
        note: 'Test transaction',
        tags: ['test', 'demo'],
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.userId).toBe(testUser.id);
      expect(data.data.amount).toBe('100.5'); // Decimal returned as string (no trailing zeros)
      expect(data.data.type).toBe('expense');
      expect(data.data.currency).toBe('EUR');
      expect(data.data.note).toBe('Test transaction');
      expect(data.data.tags).toEqual(['test', 'demo']);
      expect(data.data.category).toBeDefined();
      expect(data.data.category.name).toBe('Test Category');
      expect(data.data.category.color).toBe('#ff0000');
      expect(data.data.account).toBeDefined();
      expect(data.data.account.name).toBe('Test Account');
    });

    it('should create transaction without optional fields', async () => {
      const req = createMockRequest({
        amount: 50.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.note).toBeNull();
      expect(data.data.tags).toEqual([]);
    });

    it('should create income transaction with income category', async () => {
      // Create income category
      const incomeCategory = await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Salary',
          type: 'income',
          color: '#00ff00',
        },
      });

      const req = createMockRequest({
        amount: 5000.0,
        type: 'income',
        txnDate: new Date('2024-01-01'),
        categoryId: incomeCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.type).toBe('income');
    });

    it('should enforce user scoping - transaction belongs to authenticated user', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.userId).toBe(testUser.id);

      // Verify in database
      const transaction = await db.transaction.findUnique({
        where: { id: data.data.id },
      });

      expect(transaction?.userId).toBe(testUser.id);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required');
    });
  });

  describe('Amount validation', () => {
    it('should return 400 for negative amount', async () => {
      const req = createMockRequest({
        amount: -50.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Amount must be positive');
    });

    it('should return 400 for zero amount', async () => {
      const req = createMockRequest({
        amount: 0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Amount must be positive');
    });

    it('should return 400 for amount with more than 2 decimal places', async () => {
      const req = createMockRequest({
        amount: 100.123,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Amount must have max 2 decimal places');
    });

    it('should return 400 for amount exceeding maximum', async () => {
      const req = createMockRequest({
        amount: 10000000000, // 10 billion
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Amount too large');
    });

    it('should accept valid amounts with 1 or 2 decimal places', async () => {
      const testCases = [
        { amount: 100.0, expected: '100' },
        { amount: 100.5, expected: '100.5' },
        { amount: 100.99, expected: '100.99' },
      ];

      for (const testCase of testCases) {
        const req = createMockRequest({
          amount: testCase.amount,
          type: 'expense',
          txnDate: new Date('2024-01-15'),
          categoryId: testCategory.id,
          accountId: testAccount.id,
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.data.amount).toBe(testCase.expected);
      }
    });
  });

  describe('Date validation', () => {
    it('should return 400 for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: futureDate,
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Transaction date cannot be in the future');
    });

    it('should accept today as transaction date', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date(),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should accept past dates', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2020-01-01'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });
  });

  describe('Type validation and matching', () => {
    it('should return 400 when transaction type does not match category type', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'income', // Mismatched: category is expense
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('TYPE_MISMATCH');
      expect(data.error.message).toBe('Transaction type must match category type (expense)');
    });

    it('should return 400 for invalid transaction type', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'invalid_type',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('expense');
      expect(data.error.message).toContain('income');
    });
  });

  describe('Category ownership validation', () => {
    it('should return 404 when category does not exist', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: '00000000-0000-0000-0000-000000000000',
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_CATEGORY');
      expect(data.error.message).toBe('Category not found or access denied');
    });

    it('should return 404 when category belongs to different user', async () => {
      // Create another user
      const otherUser = await createTestUser('other@example.com', testPassword);

      // Create category for other user
      const otherCategory = await db.category.create({
        data: {
          userId: otherUser.id,
          name: 'Other Category',
          type: 'expense',
        },
      });

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: otherCategory.id,
        accountId: testAccount.id,
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
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: 'not-a-uuid',
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid category ID');
    });
  });

  describe('Account ownership validation', () => {
    it('should return 404 when account does not exist', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: '00000000-0000-0000-0000-000000000000',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_ACCOUNT');
      expect(data.error.message).toBe('Account not found or access denied');
    });

    it('should return 404 when account belongs to different user', async () => {
      // Create another user
      const otherUser = await createTestUser('other2@example.com', testPassword);

      // Create account for other user
      const otherAccount = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other Account',
        },
      });

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: otherAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('INVALID_ACCOUNT');

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });

    it('should return 400 for invalid account UUID format', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: 'not-a-uuid',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid account ID');
    });
  });

  describe('Optional fields validation', () => {
    it('should return 400 for note exceeding 500 characters', async () => {
      const longNote = 'a'.repeat(501);

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
        note: longNote,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Note too long (max 500 characters)');
    });

    it('should accept note with exactly 500 characters', async () => {
      const maxNote = 'a'.repeat(500);

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
        note: maxNote,
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should return 400 for more than 10 tags', async () => {
      const tooManyTags = Array(11).fill('tag');

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
        tags: tooManyTags,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Maximum 10 tags');
    });

    it('should accept exactly 10 tags', async () => {
      const tenTags = Array(10)
        .fill(0)
        .map((_, i) => `tag${i}`);

      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
        tags: tenTags,
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });
  });

  describe('Required fields validation', () => {
    it('should return 400 when amount is missing', async () => {
      const req = createMockRequest({
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when type is missing', async () => {
      const req = createMockRequest({
        amount: 100.0,
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when categoryId is missing', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        accountId: testAccount.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when accountId is missing', async () => {
      const req = createMockRequest({
        amount: 100.0,
        type: 'expense',
        txnDate: new Date('2024-01-15'),
        categoryId: testCategory.id,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
