import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/lib/db';
import { requireAuth, getCurrentUser } from '@/lib/auth-helpers';
import { requireApiAuth } from '@/lib/api-auth';
import * as bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Mock next-auth and next/navigation
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

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
async function cleanupTestUser(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (user) {
    // Delete child records first to respect foreign key constraints
    // Order matters: transactions reference accounts and categories
    await db.transaction.deleteMany({ where: { userId: user.id } });
    await db.budget.deleteMany({ where: { userId: user.id } });
    await db.account.deleteMany({ where: { userId: user.id } });
    await db.category.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
}

describe('Protected Routes - Auth Helpers', () => {
  const testEmail = 'protected-routes-test@example.com';
  const testPassword = 'SecurePassword123';

  beforeEach(async () => {
    await cleanupTestUser(testEmail);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestUser(testEmail);
  });

  describe('requireAuth() - Server Component helper', () => {
    it('should return user when session exists', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await requireAuth();

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.name).toBe('Test User');
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should redirect to /login when session does not exist', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Expect redirect to throw (Next.js behavior)
      await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to /login when session exists but user is missing', async () => {
      // Mock session without user (edge case)
      vi.mocked(getServerSession).mockResolvedValue({
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any);

      // Expect redirect to throw (Next.js behavior)
      await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('getCurrentUser() - Server Component helper', () => {
    it('should return user when session exists', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await getCurrentUser();

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
      expect(result?.name).toBe('Test User');
    });

    it('should return null when session does not exist', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should return null when session exists but user is missing', async () => {
      // Mock session without user (edge case)
      vi.mocked(getServerSession).mockResolvedValue({
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('requireApiAuth() - API route helper', () => {
    it('should return user when session exists', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await requireApiAuth();

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(user.id);
      expect(result.user?.email).toBe(user.email);
      expect(result.user?.name).toBe('Test User');
    });

    it('should return 401 error when session does not exist', async () => {
      // Mock no session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await requireApiAuth();

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();

      // Verify error response structure
      const errorResponse = result.error;
      expect(errorResponse?.status).toBe(401);

      // Parse JSON to verify error structure
      const errorJson = await errorResponse?.json();
      expect(errorJson.error.code).toBe('UNAUTHORIZED');
      expect(errorJson.error.message).toBe('Authentication required');
    });

    it('should return 401 error when session exists but user is missing', async () => {
      // Mock session without user (edge case)
      vi.mocked(getServerSession).mockResolvedValue({
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any);

      const result = await requireApiAuth();

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });
  });

  describe('User scoping pattern', () => {
    it('should demonstrate user scoping in API route queries', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const { error, user: authUser } = await requireApiAuth();

      // Verify auth succeeded
      expect(error).toBeNull();
      expect(authUser).toBeDefined();

      // Demonstrate proper user scoping pattern
      // All queries MUST include userId: authUser.id
      const transactions = await db.transaction.findMany({
        where: { userId: authUser!.id }, // Always scope to authenticated user
      });

      // This ensures users can only access their own data
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('should demonstrate user scoping prevents accessing other users data', async () => {
      // Create two users
      const user1 = await createTestUser(testEmail, testPassword, 'User 1');
      const user2Email = 'other-user@example.com';

      // Ensure user2 is cleaned up before creation
      await cleanupTestUser(user2Email);
      const user2 = await createTestUser(user2Email, testPassword, 'User 2');

      // Create account and category for user2
      const account2 = await db.account.create({
        data: {
          userId: user2.id,
          name: 'User 2 Account',
        },
      });

      const category2 = await db.category.create({
        data: {
          userId: user2.id,
          name: 'User 2 Category',
          type: 'expense',
        },
      });

      // Create transaction for user2
      await db.transaction.create({
        data: {
          userId: user2.id,
          accountId: account2.id,
          categoryId: category2.id,
          amount: 100.0,
          type: 'expense',
          txnDate: new Date(),
        },
      });

      // Mock session as user1
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user1.id,
          email: user1.email,
          name: user1.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const { error, user: authUser } = await requireApiAuth();
      expect(error).toBeNull();

      // Query with proper user scoping
      const user1Transactions = await db.transaction.findMany({
        where: { userId: authUser!.id },
      });

      // User 1 should NOT see User 2's transaction
      expect(user1Transactions.length).toBe(0);

      // Cleanup
      await cleanupTestUser(user2Email);
    });
  });

  describe('Helper function usage patterns', () => {
    it('should demonstrate requireAuth usage in Server Component', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Example Server Component pattern:
      // export default async function DashboardPage() {
      //   const user = await requireAuth();
      //   return <div>Welcome, {user.name}</div>;
      // }

      const authUser = await requireAuth();
      expect(authUser.name).toBe('Test User');
    });

    it('should demonstrate requireApiAuth usage in API route', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Example API route pattern:
      // export async function GET(req: Request) {
      //   const { error, user } = await requireApiAuth();
      //   if (error) return error;
      //
      //   const transactions = await db.transaction.findMany({
      //     where: { userId: user.id },
      //   });
      //
      //   return NextResponse.json({ data: transactions });
      // }

      const { error, user: authUser } = await requireApiAuth();
      expect(error).toBeNull();
      expect(authUser?.id).toBe(user.id);

      // Simulate query with user scoping
      const transactions = await db.transaction.findMany({
        where: { userId: authUser!.id },
      });

      expect(transactions).toBeDefined();
    });
  });
});
