import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { resetRateLimit } from '@/lib/rate-limit';
import * as bcrypt from 'bcryptjs';

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
    await db.account.deleteMany({ where: { userId: user.id } });
    await db.category.deleteMany({ where: { userId: user.id } });
    await db.transaction.deleteMany({ where: { userId: user.id } });
    await db.budget.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
}

describe('NextAuth Login - Credentials Provider', () => {
  const testEmail = 'login-test@example.com';
  const testPassword = 'SecurePassword123';

  beforeEach(async () => {
    // Clean up before each test
    await cleanupTestUser(testEmail);
    // Reset rate limit for test email
    resetRateLimit(`login:${testEmail.toLowerCase()}`);
  });

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestUser(testEmail);
  });

  describe('Successful login', () => {
    it('should authenticate user with valid email and password', async () => {
      // Create test user
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Get the authorize function from authOptions
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      expect(credentialsProvider).toBeDefined();

      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;
      expect(authorize).toBeDefined();

      // Call authorize with valid credentials
      const result = await authorize(
        {
          email: testEmail,
          password: testPassword,
        },
        {} as any
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(testEmail);
      expect(result?.name).toBe('Test User');
    });

    it('should work with case-insensitive email matching', async () => {
      // Create user with lowercase email
      const user = await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Try login with uppercase email
      const result = await authorize(
        {
          email: testEmail.toUpperCase(),
          password: testPassword,
        },
        {} as any
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(testEmail);
    });

    it('should authenticate user without optional name field', async () => {
      // Create user without name
      const user = await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      const result = await authorize(
        {
          email: testEmail,
          password: testPassword,
        },
        {} as any
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(testEmail);
      expect(result?.name).toBeNull();
    });
  });

  describe('Invalid credentials', () => {
    it('should reject login with wrong password', async () => {
      // Create test user
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Attempt login with wrong password
      await expect(
        authorize(
          {
            email: testEmail,
            password: 'WrongPassword123',
          },
          {} as any
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login for unregistered email', async () => {
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Attempt login with non-existent email (prevents email enumeration)
      await expect(
        authorize(
          {
            email: 'nonexistent@example.com',
            password: testPassword,
          },
          {} as any
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with missing email', async () => {
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Attempt login without email
      await expect(
        authorize(
          {
            email: '',
            password: testPassword,
          },
          {} as any
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with missing password', async () => {
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Attempt login without password
      await expect(
        authorize(
          {
            email: testEmail,
            password: '',
          },
          {} as any
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with both missing email and password', async () => {
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Attempt login without credentials
      await expect(
        authorize(
          {
            email: '',
            password: '',
          },
          {} as any
        )
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Session callbacks', () => {
    it('should populate JWT token with user data', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Test JWT callback
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      const token = await jwtCallback!(
        {
          token: {} as any,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
        {} as any
      );

      expect(token.id).toBe(user.id);
      expect(token.email).toBe(user.email);
      expect(token.name).toBe('Test User');
    });

    it('should populate session with token data', async () => {
      const user = await createTestUser(testEmail, testPassword, 'Test User');

      // Test session callback
      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      const session = await sessionCallback!(
        {
          session: {
            user: {} as any,
            expires: new Date().toISOString(),
          },
          token: {
            id: user.id,
            email: user.email,
            name: user.name,
          } as any,
        },
        {} as any
      );

      expect(session.user.id).toBe(user.id);
      expect(session.user.email).toBe(user.email);
      expect(session.user.name).toBe('Test User');
    });
  });

  describe('Security', () => {
    it('should never return password hash in user object', async () => {
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      const result = await authorize(
        {
          email: testEmail,
          password: testPassword,
        },
        {} as any
      );

      expect(result).toBeDefined();
      // @ts-expect-error - checking if passwordHash exists
      expect(result?.passwordHash).toBeUndefined();
    });

    it('should use generic error message to prevent email enumeration', async () => {
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Test wrong password
      try {
        await authorize(
          {
            email: testEmail,
            password: 'WrongPassword',
          },
          {} as any
        );
      } catch (error) {
        expect((error as Error).message).toBe('Invalid credentials');
      }

      // Test non-existent email
      try {
        await authorize(
          {
            email: 'nonexistent@example.com',
            password: testPassword,
          },
          {} as any
        );
      } catch (error) {
        expect((error as Error).message).toBe('Invalid credentials');
      }

      // Both should return the same error message
    });
  });

  describe('Password verification', () => {
    it('should verify password using bcrypt', async () => {
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Successful verification
      const result = await authorize(
        {
          email: testEmail,
          password: testPassword,
        },
        {} as any
      );

      expect(result).toBeDefined();

      // Failed verification with wrong password
      await expect(
        authorize(
          {
            email: testEmail,
            password: 'WrongPassword',
          },
          {} as any
        )
      ).rejects.toThrow();
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      await createTestUser(testEmail, specialPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      const result = await authorize(
        {
          email: testEmail,
          password: specialPassword,
        },
        {} as any
      );

      expect(result).toBeDefined();
    });
  });

  describe('Rate limiting', () => {
    it('should block login after 5 failed attempts', async () => {
      // Create test user
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Make 5 failed login attempts (wrong password)
      for (let i = 0; i < 5; i++) {
        try {
          await authorize(
            {
              email: testEmail,
              password: 'WrongPassword',
            },
            {} as any
          );
        } catch (error) {
          // Expected to fail
          expect((error as Error).message).toBe('Invalid credentials');
        }
      }

      // 6th attempt should be rate limited
      try {
        await authorize(
          {
            email: testEmail,
            password: 'WrongPassword',
          },
          {} as any
        );
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect((error as Error).message).toContain('Too many login attempts');
        expect((error as Error).message).toContain('Try again in');
        expect((error as Error).message).toContain('seconds');
      }
    });

    it('should include retry time in rate limit error message', async () => {
      // Create test user
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Make 5 attempts to trigger rate limit
      for (let i = 0; i < 5; i++) {
        try {
          await authorize(
            {
              email: testEmail,
              password: testPassword,
            },
            {} as any
          );
          break; // If successful, no need to continue
        } catch (error) {
          // Continue attempting
        }
      }

      // Next attempt should show retry time
      try {
        await authorize(
          {
            email: testEmail,
            password: testPassword,
          },
          {} as any
        );
      } catch (error) {
        const message = (error as Error).message;
        // Should contain "Try again in X seconds"
        const retryMatch = message.match(/Try again in (\d+) seconds/);
        expect(retryMatch).toBeTruthy();
        if (retryMatch) {
          const seconds = parseInt(retryMatch[1]);
          expect(seconds).toBeGreaterThan(0);
          expect(seconds).toBeLessThanOrEqual(15 * 60); // Max 15 minutes
        }
      }
    });

    it('should track rate limits per email independently', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      // Create two test users
      await createTestUser(email1, testPassword);
      await createTestUser(email2, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Make 5 failed attempts for email1
      for (let i = 0; i < 5; i++) {
        try {
          await authorize({ email: email1, password: 'wrong' }, {} as any);
        } catch (error) {
          // Expected
        }
      }

      // Email1 should be rate limited
      try {
        await authorize({ email: email1, password: 'wrong' }, {} as any);
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        expect((error as Error).message).toContain('Too many login attempts');
      }

      // Email2 should still work (be rate limited independently)
      const result = await authorize({ email: email2, password: testPassword }, {} as any);
      expect(result).toBeDefined();

      // Cleanup
      await cleanupTestUser(email1);
      await cleanupTestUser(email2);
      resetRateLimit(`login:${email1.toLowerCase()}`);
      resetRateLimit(`login:${email2.toLowerCase()}`);
    });

    it('should count successful login attempts towards rate limit', async () => {
      // Create test user
      await createTestUser(testEmail, testPassword);

      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      // @ts-expect-error - accessing authorize from provider
      const authorize = credentialsProvider?.options?.authorize;

      // Make 5 successful login attempts
      for (let i = 0; i < 5; i++) {
        const result = await authorize(
          {
            email: testEmail,
            password: testPassword,
          },
          {} as any
        );
        expect(result).toBeDefined();
      }

      // 6th attempt should be rate limited (even if credentials are correct)
      try {
        await authorize(
          {
            email: testEmail,
            password: testPassword,
          },
          {} as any
        );
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        expect((error as Error).message).toContain('Too many login attempts');
      }
    });
  });
});
