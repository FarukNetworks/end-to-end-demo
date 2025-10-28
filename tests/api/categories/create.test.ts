import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/categories/route';
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

describe('POST /api/categories', () => {
  const testEmail = 'category-create-test@example.com';
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

  describe('Successful category creation', () => {
    it('should create category with valid data and return 201', async () => {
      const req = createMockRequest({
        name: 'Groceries',
        color: '#ff5733',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.userId).toBe(testUser.id);
      expect(data.data.name).toBe('Groceries');
      expect(data.data.color).toBe('#ff5733');
      expect(data.data.type).toBe('expense');
      expect(data.data.isSystem).toBe(false);
      expect(data.data.createdAt).toBeDefined();
    });

    it('should create category without color and apply default', async () => {
      const req = createMockRequest({
        name: 'Shopping',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.color).toBe('#22c55e');
      expect(data.data.isSystem).toBe(false);
    });

    it('should create income category', async () => {
      const req = createMockRequest({
        name: 'Salary',
        color: '#00ff00',
        type: 'income',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.type).toBe('income');
      expect(data.data.isSystem).toBe(false);
    });

    it('should enforce user scoping - category belongs to authenticated user', async () => {
      const req = createMockRequest({
        name: 'Test Category',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.userId).toBe(testUser.id);

      // Verify in database
      const category = await db.category.findUnique({
        where: { id: data.data.id },
      });

      expect(category?.userId).toBe(testUser.id);
      expect(category?.isSystem).toBe(false);
    });

    it('should accept uppercase and lowercase hex colors', async () => {
      const testCases = [
        { color: '#FF5733', expected: '#FF5733', name: 'Test-Uppercase' },
        { color: '#ff5733', expected: '#ff5733', name: 'Test-Lowercase' },
        { color: '#AbCdEf', expected: '#AbCdEf', name: 'Test-Mixed' },
      ];

      for (const testCase of testCases) {
        const req = createMockRequest({
          name: testCase.name,
          color: testCase.color,
          type: 'expense',
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.data.color).toBe(testCase.expected);
      }
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = createMockRequest({
        name: 'Test Category',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required');
    });
  });

  describe('Name validation', () => {
    it('should return 400 for empty name', async () => {
      const req = createMockRequest({
        name: '',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Name is required');
    });

    it('should return 400 for name exceeding 50 characters', async () => {
      const longName = 'a'.repeat(51);

      const req = createMockRequest({
        name: longName,
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Name too long');
    });

    it('should accept name with exactly 50 characters', async () => {
      const maxName = 'a'.repeat(50);

      const req = createMockRequest({
        name: maxName,
        type: 'expense',
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should return 400 when name is missing', async () => {
      const req = createMockRequest({
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Duplicate name validation', () => {
    it('should return 409 for duplicate name (exact match)', async () => {
      // Create first category
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Shopping',
          type: 'expense',
          color: '#ff0000',
        },
      });

      // Try to create duplicate
      const req = createMockRequest({
        name: 'Shopping',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('DUPLICATE_NAME');
      expect(data.error.message).toBe('Category name already exists');
    });

    it('should return 409 for duplicate name (case-insensitive)', async () => {
      // Create first category
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Shopping',
          type: 'expense',
          color: '#ff0000',
        },
      });

      // Try to create duplicate with different case
      const testCases = ['shopping', 'SHOPPING', 'ShOpPiNg'];

      for (const name of testCases) {
        const req = createMockRequest({
          name,
          type: 'expense',
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error.code).toBe('DUPLICATE_NAME');
        expect(data.error.message).toBe('Category name already exists');
      }
    });

    it('should allow duplicate name for different users', async () => {
      // Create category for first user
      await db.category.create({
        data: {
          userId: testUser.id,
          name: 'Groceries',
          type: 'expense',
        },
      });

      // Create second user
      const otherUser = await createTestUser('other@example.com', testPassword);

      // Mock session for other user
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: otherUser.id,
          email: otherUser.email,
          name: otherUser.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Try to create same category name for different user
      const req = createMockRequest({
        name: 'Groceries',
        type: 'expense',
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });
  });

  describe('Color validation', () => {
    it('should return 400 for invalid color format (missing #)', async () => {
      const req = createMockRequest({
        name: 'Test',
        color: 'FF5733',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid color format');
    });

    it('should return 400 for invalid color format (wrong length)', async () => {
      const invalidColors = ['#FFF', '#FFFFFFF', '#FF'];

      for (const color of invalidColors) {
        const req = createMockRequest({
          name: `Test-${color}`,
          color,
          type: 'expense',
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.message).toBe('Invalid color format');
      }
    });

    it('should return 400 for invalid color format (non-hex characters)', async () => {
      const req = createMockRequest({
        name: 'Test',
        color: '#GGGGGG',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid color format');
    });

    it('should accept valid hex colors', async () => {
      const validColors = ['#000000', '#FFFFFF', '#ff5733', '#ABC123'];

      for (const color of validColors) {
        const req = createMockRequest({
          name: `Test-${color}`,
          color,
          type: 'expense',
        });

        const response = await POST(req as any);

        expect(response.status).toBe(201);
      }
    });
  });

  describe('Type validation', () => {
    it('should return 400 for invalid type', async () => {
      const req = createMockRequest({
        name: 'Test',
        type: 'invalid_type',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Type must be expense or income');
    });

    it('should return 400 when type is missing', async () => {
      const req = createMockRequest({
        name: 'Test',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept expense type', async () => {
      const req = createMockRequest({
        name: 'Test Expense',
        type: 'expense',
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should accept income type', async () => {
      const req = createMockRequest({
        name: 'Test Income',
        type: 'income',
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });
  });

  describe('isSystem field', () => {
    it('should always set isSystem to false for custom categories', async () => {
      const req = createMockRequest({
        name: 'Custom Category',
        type: 'expense',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.isSystem).toBe(false);

      // Verify in database
      const category = await db.category.findUnique({
        where: { id: data.data.id },
      });

      expect(category?.isSystem).toBe(false);
    });
  });
});
