import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/accounts/route';
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

describe('POST /api/accounts', () => {
  const testEmail = 'account-create-test@example.com';
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

  describe('Successful account creation', () => {
    it('should create account with valid data and return 201', async () => {
      const req = createMockRequest({
        name: 'Checking Account',
        color: '#3b82f6',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.userId).toBe(testUser.id);
      expect(data.data.name).toBe('Checking Account');
      expect(data.data.color).toBe('#3b82f6');
      expect(data.data.createdAt).toBeDefined();
    });

    it('should create account without color and apply default #6b7280', async () => {
      const req = createMockRequest({
        name: 'Savings Account',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.color).toBe('#6b7280');
    });

    it('should enforce user scoping - account belongs to authenticated user', async () => {
      const req = createMockRequest({
        name: 'Test Account',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.userId).toBe(testUser.id);

      // Verify in database
      const account = await db.account.findUnique({
        where: { id: data.data.id },
      });

      expect(account?.userId).toBe(testUser.id);
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
        name: 'Test Account',
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
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Name too long (max 50 characters)');
    });

    it('should accept name with exactly 50 characters', async () => {
      const maxName = 'a'.repeat(50);

      const req = createMockRequest({
        name: maxName,
      });

      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should return 400 when name is missing', async () => {
      const req = createMockRequest({
        color: '#ff5733',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should trim whitespace from name', async () => {
      const req = createMockRequest({
        name: '  Test Account  ',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.name).toBe('Test Account');
    });
  });

  describe('Duplicate name validation', () => {
    it('should return 409 for duplicate name (exact match)', async () => {
      // Create first account
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking',
          color: '#ff0000',
        },
      });

      // Try to create duplicate
      const req = createMockRequest({
        name: 'Checking',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('DUPLICATE_NAME');
      expect(data.error.message).toBe('Account name already exists');
    });

    it('should return 409 for duplicate name (case-insensitive)', async () => {
      // Create first account
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking',
          color: '#ff0000',
        },
      });

      // Try to create duplicate with different case
      const testCases = ['checking', 'CHECKING', 'ChEcKiNg'];

      for (const name of testCases) {
        const req = createMockRequest({
          name,
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error.code).toBe('DUPLICATE_NAME');
        expect(data.error.message).toBe('Account name already exists');
      }
    });

    it('should allow duplicate name for different users', async () => {
      // Create account for first user
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking',
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

      // Try to create same account name for different user
      const req = createMockRequest({
        name: 'Checking',
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
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid color format (use #RRGGBB)');
    });

    it('should return 400 for invalid color format (wrong length)', async () => {
      const invalidColors = ['#FFF', '#FFFFFFF', '#FF'];

      for (const color of invalidColors) {
        const req = createMockRequest({
          name: `Test-${color}`,
          color,
        });

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.message).toBe('Invalid color format (use #RRGGBB)');
      }
    });

    it('should return 400 for invalid color format (non-hex characters)', async () => {
      const req = createMockRequest({
        name: 'Test',
        color: '#GGGGGG',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid color format (use #RRGGBB)');
    });

    it('should accept valid hex colors', async () => {
      const validColors = ['#000000', '#FFFFFF', '#ff5733', '#ABC123'];

      for (const color of validColors) {
        const req = createMockRequest({
          name: `Test-${color}`,
          color,
        });

        const response = await POST(req as any);

        expect(response.status).toBe(201);
      }
    });
  });
});
