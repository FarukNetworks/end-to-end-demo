import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PATCH } from '@/app/api/accounts/[id]/route';
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

describe('PATCH /api/accounts/:id', () => {
  const testEmail = 'account-update-test@example.com';
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

  describe('Successful account updates', () => {
    it('should update account name and return 200', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Original Name',
          color: '#ff0000',
        },
      });

      const req = createMockRequest({
        name: 'Updated Name',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(account.id);
      expect(data.data.name).toBe('Updated Name');
      expect(data.data.color).toBe('#ff0000'); // Color unchanged
    });

    it('should update account color and return 200', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test Account',
          color: '#ff0000',
        },
      });

      const req = createMockRequest({
        color: '#00ff00',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('Test Account'); // Name unchanged
      expect(data.data.color).toBe('#00ff00');
    });

    it('should update both name and color', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Original',
          color: '#ff0000',
        },
      });

      const req = createMockRequest({
        name: 'New Name',
        color: '#0000ff',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('New Name');
      expect(data.data.color).toBe('#0000ff');
    });

    it('should accept empty update body (no changes)', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test',
          color: '#ff0000',
        },
      });

      const req = createMockRequest({});

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('Test');
      expect(data.data.color).toBe('#ff0000');
    });

    it('should allow updating to same name (no duplicate check)', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Same Name',
          color: '#ff0000',
        },
      });

      const req = createMockRequest({
        name: 'Same Name',
        color: '#00ff00',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      expect(response.status).toBe(200);
    });

    it('should enforce user scoping - account belongs to authenticated user', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'User Account',
        },
      });

      const req = createMockRequest({
        name: 'Updated',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      expect(response.status).toBe(200);

      // Verify in database
      const updated = await db.account.findUnique({
        where: { id: account.id },
      });

      expect(updated?.userId).toBe(testUser.id);
      expect(updated?.name).toBe('Updated');
    });
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = createMockRequest({
        name: 'Updated Name',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: 'some-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Authentication required');
    });
  });

  describe('Authorization', () => {
    it('should return 404 for account owned by different user', async () => {
      // Create another user
      const otherUser = await createTestUser('other@example.com', testPassword);

      // Create account for other user
      const account = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Account',
        },
      });

      // Try to update as testUser
      const req = createMockRequest({
        name: 'Hacked Name',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Account not found');

      // Verify account was not updated
      const unchanged = await db.account.findUnique({
        where: { id: account.id },
      });
      expect(unchanged?.name).toBe('Other User Account');

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });

    it('should return 404 for non-existent account ID', async () => {
      const req = createMockRequest({
        name: 'Updated Name',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: 'non-existent-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Account not found');
    });
  });

  describe('Name validation', () => {
    it('should return 400 for empty name', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Original',
        },
      });

      const req = createMockRequest({
        name: '',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Name is required');
    });

    it('should return 400 for name exceeding 50 characters', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Original',
        },
      });

      const longName = 'a'.repeat(51);

      const req = createMockRequest({
        name: longName,
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Name too long');
    });

    it('should accept name with exactly 50 characters', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Original',
        },
      });

      const maxName = 'a'.repeat(50);

      const req = createMockRequest({
        name: maxName,
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });

      expect(response.status).toBe(200);
    });

    it('should trim whitespace from name', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Original',
        },
      });

      const req = createMockRequest({
        name: '  Updated Account  ',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('Updated Account');
    });
  });

  describe('Duplicate name validation', () => {
    it('should return 409 for duplicate name (exact match)', async () => {
      // Create two accounts
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Existing Account',
          color: '#ff0000',
        },
      });

      const account2 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Other Account',
          color: '#00ff00',
        },
      });

      // Try to update account2 to have same name as account1
      const req = createMockRequest({
        name: 'Existing Account',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account2.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('DUPLICATE_NAME');
      expect(data.error.message).toBe('Account name already exists');
    });

    it('should return 409 for duplicate name (case-insensitive)', async () => {
      // Create two accounts
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Checking',
        },
      });

      const account2 = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Other',
        },
      });

      // Try different case variations
      const testCases = ['checking', 'CHECKING', 'ChEcKiNg'];

      for (const name of testCases) {
        const req = createMockRequest({ name });

        const response = await PATCH(req as any, {
          params: Promise.resolve({ id: account2.id }),
        });
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error.code).toBe('DUPLICATE_NAME');
        expect(data.error.message).toBe('Account name already exists');
      }
    });

    it('should allow duplicate name across different users', async () => {
      // Create account for first user
      await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Shared Name',
        },
      });

      // Create second user and account
      const otherUser = await createTestUser('other-user-update-test@example.com', testPassword);
      const account2 = await db.account.create({
        data: {
          userId: otherUser.id,
          name: 'Different Name',
        },
      });

      // Mock session for other user
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: otherUser.id,
          email: otherUser.email,
          name: otherUser.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Try to update other user's account to same name
      const req = createMockRequest({
        name: 'Shared Name',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account2.id }),
      });

      expect(response.status).toBe(200);

      // Cleanup
      await cleanupTestUser(otherUser.id);
    });

    it('should not trigger duplicate check when name is unchanged', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Unchanged Name',
        },
      });

      const req = createMockRequest({
        name: 'Unchanged Name',
        color: '#00ff00',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('Unchanged Name');
      expect(data.data.color).toBe('#00ff00');
    });
  });

  describe('Color validation', () => {
    it('should return 400 for invalid color format (missing #)', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test',
        },
      });

      const req = createMockRequest({
        color: 'FF5733',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid color format');
    });

    it('should return 400 for invalid color format (wrong length)', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test',
        },
      });

      const invalidColors = ['#FFF', '#FFFFFFF', '#FF'];

      for (const color of invalidColors) {
        const req = createMockRequest({ color });

        const response = await PATCH(req as any, {
          params: Promise.resolve({ id: account.id }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.message).toBe('Invalid color format');
      }
    });

    it('should return 400 for invalid color format (non-hex characters)', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test',
        },
      });

      const req = createMockRequest({
        color: '#GGGGGG',
      });

      const response = await PATCH(req as any, {
        params: Promise.resolve({ id: account.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid color format');
    });

    it('should accept valid hex colors', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test',
        },
      });

      const validColors = ['#000000', '#FFFFFF', '#ff5733', '#ABC123'];

      for (const color of validColors) {
        const req = createMockRequest({ color });

        const response = await PATCH(req as any, {
          params: Promise.resolve({ id: account.id }),
        });

        expect(response.status).toBe(200);
      }
    });

    it('should accept uppercase and lowercase hex colors', async () => {
      // Create account
      const account = await db.account.create({
        data: {
          userId: testUser.id,
          name: 'Test',
        },
      });

      const testCases = [
        { color: '#FF5733', expected: '#FF5733' },
        { color: '#ff5733', expected: '#ff5733' },
        { color: '#AbCdEf', expected: '#AbCdEf' },
      ];

      for (const testCase of testCases) {
        const req = createMockRequest({ color: testCase.color });

        const response = await PATCH(req as any, {
          params: Promise.resolve({ id: account.id }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.color).toBe(testCase.expected);
      }
    });
  });
});
