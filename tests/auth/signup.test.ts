import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { db } from '@/lib/db';
import { resetRateLimit } from '@/lib/rate-limit';
import * as bcrypt from 'bcryptjs';

// Mock request helper
function createMockRequest(body: unknown, ip = '127.0.0.1'): Request {
  return {
    json: async () => body,
    headers: new Headers({
      'x-forwarded-for': ip,
    }),
  } as unknown as Request;
}

describe('POST /api/auth/signup', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  beforeEach(async () => {
    // Clean up test user and related data before each test
    const user = await db.user.findUnique({
      where: { email: testEmail },
    });

    if (user) {
      // Delete child records first to respect foreign key constraints
      await db.account.deleteMany({ where: { userId: user.id } });
      await db.category.deleteMany({ where: { userId: user.id } });
      await db.transaction.deleteMany({ where: { userId: user.id } });
      await db.budget.deleteMany({ where: { userId: user.id } });
      await db.user.delete({ where: { id: user.id } });
    }

    // Reset rate limit for test IP (using signup: prefix)
    resetRateLimit('signup:127.0.0.1');
  });

  afterEach(async () => {
    // Clean up after tests
    const user = await db.user.findUnique({
      where: { email: testEmail },
    });

    if (user) {
      // Delete child records first to respect foreign key constraints
      await db.account.deleteMany({ where: { userId: user.id } });
      await db.category.deleteMany({ where: { userId: user.id } });
      await db.transaction.deleteMany({ where: { userId: user.id } });
      await db.budget.deleteMany({ where: { userId: user.id } });
      await db.user.delete({ where: { id: user.id } });
    }
  });

  describe('Successful signup', () => {
    it('should create user with valid email and password', async () => {
      const req = createMockRequest({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.name).toBe('Test User');
      expect(data.user.id).toBeDefined();
      expect(data.user.passwordHash).toBeUndefined(); // Password should never be returned
    });

    it('should hash password with bcrypt', async () => {
      const req = createMockRequest({
        email: testEmail,
        password: testPassword,
      });

      const response = await POST(req as any);
      expect(response.status).toBe(201);

      // Verify password is hashed in database
      const user = await db.user.findUnique({
        where: { email: testEmail },
      });

      expect(user).toBeDefined();
      expect(user!.passwordHash).not.toBe(testPassword);
      expect(user!.passwordHash.startsWith('$2a$') || user!.passwordHash.startsWith('$2b$')).toBe(
        true
      );

      // Verify password can be verified
      const isValid = await bcrypt.compare(testPassword, user!.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should create default categories for new user', async () => {
      const req = createMockRequest({
        email: testEmail,
        password: testPassword,
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(201);

      // Verify categories were created
      const categories = await db.category.findMany({
        where: { userId: data.user.id },
      });

      expect(categories.length).toBe(10);
      expect(categories.some((c) => c.name === 'Groceries')).toBe(true);
      expect(categories.some((c) => c.name === 'Salary')).toBe(true);
    });

    it('should create default accounts for new user', async () => {
      const req = createMockRequest({
        email: testEmail,
        password: testPassword,
      });

      const response = await POST(req as any);
      const data = await response.json();
      expect(response.status).toBe(201);

      // Verify accounts were created
      const accounts = await db.account.findMany({
        where: { userId: data.user.id },
      });

      expect(accounts.length).toBe(2);
      expect(accounts.some((a) => a.name === 'Cash')).toBe(true);
      expect(accounts.some((a) => a.name === 'Card')).toBe(true);
    });

    it('should work without optional name field', async () => {
      const req = createMockRequest({
        email: testEmail,
        password: testPassword,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.name).toBeNull();
    });
  });

  describe('Duplicate email', () => {
    it('should return 409 when email already exists', async () => {
      // Create initial user
      const req1 = createMockRequest({
        email: testEmail,
        password: testPassword,
      });
      await POST(req1 as any);

      // Attempt duplicate signup
      const req2 = createMockRequest({
        email: testEmail,
        password: 'differentPassword',
      });
      const response = await POST(req2 as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('EMAIL_EXISTS');
      expect(data.error.message).toBe('Email already registered');
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for invalid email format', async () => {
      const req = createMockRequest({
        email: 'notanemail',
        password: testPassword,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Invalid email format');
    });

    it('should return 400 for short password (< 8 characters)', async () => {
      const req = createMockRequest({
        email: testEmail,
        password: 'short',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Password must be at least 8 characters');
    });

    it('should return 400 for missing email', async () => {
      const req = createMockRequest({
        password: testPassword,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing password', async () => {
      const req = createMockRequest({
        email: testEmail,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Rate limiting', () => {
    it('should return 429 after 3 signup attempts from same IP', async () => {
      const ip = '192.168.1.100';

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const req = createMockRequest(
          {
            email: `test${i}@example.com`,
            password: testPassword,
          },
          ip
        );
        const response = await POST(req as any);
        expect(response.status).toBe(201);

        // Clean up
        const user = await db.user.findUnique({
          where: { email: `test${i}@example.com` },
        });
        if (user) {
          await db.account.deleteMany({ where: { userId: user.id } });
          await db.category.deleteMany({ where: { userId: user.id } });
          await db.user.delete({ where: { id: user.id } });
        }
      }

      // 4th request should be rate limited
      const req4 = createMockRequest(
        {
          email: 'test4@example.com',
          password: testPassword,
        },
        ip
      );
      const response = await POST(req4 as any);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(data.error.message).toContain('Too many signup attempts');
      expect(data.error.message).toContain('Try again in');
      expect(data.error.message).toContain('seconds');

      // Reset rate limit for cleanup
      resetRateLimit(`signup:${ip}`);
    });

    it('should include Retry-After header in rate limit response', async () => {
      const ip = '192.168.1.101';

      // Make 3 successful requests
      for (let i = 0; i < 3; i++) {
        const req = createMockRequest(
          {
            email: `retry-test${i}@example.com`,
            password: testPassword,
          },
          ip
        );
        await POST(req as any);

        // Clean up
        const user = await db.user.findUnique({
          where: { email: `retry-test${i}@example.com` },
        });
        if (user) {
          await db.account.deleteMany({ where: { userId: user.id } });
          await db.category.deleteMany({ where: { userId: user.id } });
          await db.user.delete({ where: { id: user.id } });
        }
      }

      // 4th request should include Retry-After header
      const req4 = createMockRequest(
        {
          email: 'retry-test-final@example.com',
          password: testPassword,
        },
        ip
      );
      const response = await POST(req4 as any);

      expect(response.status).toBe(429);

      // Verify Retry-After header
      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeDefined();
      expect(retryAfter).not.toBeNull();

      // Should be a numeric value in seconds
      const retrySeconds = parseInt(retryAfter || '0');
      expect(retrySeconds).toBeGreaterThan(0);
      expect(retrySeconds).toBeLessThanOrEqual(60 * 60); // Max 1 hour

      // Reset rate limit for cleanup
      resetRateLimit(`signup:${ip}`);
    });

    it('should allow signups from different IPs', async () => {
      const req1 = createMockRequest(
        {
          email: 'user1@example.com',
          password: testPassword,
        },
        '192.168.1.1'
      );
      const response1 = await POST(req1 as any);
      expect(response1.status).toBe(201);

      const req2 = createMockRequest(
        {
          email: 'user2@example.com',
          password: testPassword,
        },
        '192.168.1.2'
      );
      const response2 = await POST(req2 as any);
      expect(response2.status).toBe(201);

      // Cleanup
      for (const email of ['user1@example.com', 'user2@example.com']) {
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
          await db.account.deleteMany({ where: { userId: user.id } });
          await db.category.deleteMany({ where: { userId: user.id } });
          await db.user.delete({ where: { id: user.id } });
        }
      }
      resetRateLimit('192.168.1.1');
      resetRateLimit('192.168.1.2');
    });
  });

  describe('Transaction atomicity', () => {
    it('should create user, categories, and accounts atomically', async () => {
      // This test verifies that the transaction creates all related data together
      const req = createMockRequest({
        email: testEmail,
        password: testPassword,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify all data was created together
      const user = await db.user.findUnique({
        where: { id: data.user.id },
        include: {
          categories: true,
          accounts: true,
        },
      });

      expect(user).toBeDefined();
      expect(user?.categories.length).toBe(10);
      expect(user?.accounts.length).toBe(2);
    });
  });
});
