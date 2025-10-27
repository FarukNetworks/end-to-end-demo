import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, rateLimiters, resetRateLimit } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  describe('rateLimit function', () => {
    const testIdentifier = 'test-user';

    beforeEach(() => {
      // Clear rate limit before each test
      resetRateLimit(testIdentifier);
    });

    it('should allow first request', async () => {
      const result = await rateLimit(testIdentifier, {
        interval: 60 * 1000, // 1 minute
        maxAttempts: 3,
      });

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should track remaining attempts correctly', async () => {
      const config = { interval: 60 * 1000, maxAttempts: 3 };

      // First attempt
      const result1 = await rateLimit(testIdentifier, config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      // Second attempt
      const result2 = await rateLimit(testIdentifier, config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      // Third attempt
      const result3 = await rateLimit(testIdentifier, config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block request when limit exceeded', async () => {
      const config = { interval: 60 * 1000, maxAttempts: 3 };

      // Make 3 successful attempts
      await rateLimit(testIdentifier, config);
      await rateLimit(testIdentifier, config);
      await rateLimit(testIdentifier, config);

      // Fourth attempt should be blocked
      const result = await rateLimit(testIdentifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should use sliding window - old attempts expire', async () => {
      const config = { interval: 100, maxAttempts: 2 }; // 100ms window

      // Make 2 attempts
      await rateLimit(testIdentifier, config);
      await rateLimit(testIdentifier, config);

      // Third attempt should be blocked immediately
      const blockedResult = await rateLimit(testIdentifier, config);
      expect(blockedResult.success).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed now
      const allowedResult = await rateLimit(testIdentifier, config);
      expect(allowedResult.success).toBe(true);
      expect(allowedResult.remaining).toBe(1);
    });

    it('should calculate correct reset time when blocked', async () => {
      const config = { interval: 60 * 1000, maxAttempts: 2 };

      const start = Date.now();
      await rateLimit(testIdentifier, config);
      await rateLimit(testIdentifier, config);

      // Third attempt blocked
      const result = await rateLimit(testIdentifier, config);
      expect(result.success).toBe(false);

      // Reset time should be ~60s from the first attempt
      const resetDelta = result.reset - start;
      expect(resetDelta).toBeGreaterThanOrEqual(59000);
      expect(resetDelta).toBeLessThanOrEqual(61000);
    });

    it('should handle different identifiers independently', async () => {
      const config = { interval: 60 * 1000, maxAttempts: 2 };

      // Make 2 attempts for first identifier
      await rateLimit('user1', config);
      await rateLimit('user1', config);

      // First identifier should be blocked
      const result1 = await rateLimit('user1', config);
      expect(result1.success).toBe(false);

      // Second identifier should still be allowed
      const result2 = await rateLimit('user2', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      // Cleanup
      resetRateLimit('user1');
      resetRateLimit('user2');
    });
  });

  describe('rateLimiters.login', () => {
    const testEmail = 'test@example.com';

    beforeEach(() => {
      resetRateLimit(`login:${testEmail}`);
    });

    it('should allow up to 5 login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiters.login(testEmail);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block 6th login attempt within 15 minutes', async () => {
      // Make 5 attempts
      for (let i = 0; i < 5; i++) {
        await rateLimiters.login(testEmail);
      }

      // 6th attempt should be blocked
      const result = await rateLimiters.login(testEmail);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);

      // Reset time should be ~15 minutes from now
      const resetDelta = result.reset - Date.now();
      expect(resetDelta).toBeGreaterThan(14 * 60 * 1000);
      expect(resetDelta).toBeLessThanOrEqual(15 * 60 * 1000);
    });

    it('should normalize email to lowercase', async () => {
      // Make attempts with different casings
      await rateLimiters.login('Test@Example.com');
      await rateLimiters.login('test@example.com');
      await rateLimiters.login('TEST@EXAMPLE.COM');

      const result = await rateLimiters.login(testEmail);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1); // 3 previous + 1 current = 4 total

      // Cleanup with normalized email
      resetRateLimit(`login:test@example.com`);
    });
  });

  describe('rateLimiters.signup', () => {
    const testIp = '192.168.1.1';

    beforeEach(() => {
      resetRateLimit(`signup:${testIp}`);
    });

    it('should allow up to 3 signup attempts', async () => {
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiters.signup(testIp);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(2 - i);
      }
    });

    it('should block 4th signup attempt within 1 hour', async () => {
      // Make 3 attempts
      for (let i = 0; i < 3; i++) {
        await rateLimiters.signup(testIp);
      }

      // 4th attempt should be blocked
      const result = await rateLimiters.signup(testIp);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);

      // Reset time should be ~1 hour from now
      const resetDelta = result.reset - Date.now();
      expect(resetDelta).toBeGreaterThan(59 * 60 * 1000);
      expect(resetDelta).toBeLessThanOrEqual(60 * 60 * 1000);
    });

    it('should track different IPs independently', async () => {
      // Make 3 attempts from first IP
      await rateLimiters.signup('192.168.1.1');
      await rateLimiters.signup('192.168.1.1');
      await rateLimiters.signup('192.168.1.1');

      // First IP should be blocked
      const result1 = await rateLimiters.signup('192.168.1.1');
      expect(result1.success).toBe(false);

      // Second IP should still be allowed
      const result2 = await rateLimiters.signup('192.168.1.2');
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(2);

      // Cleanup
      resetRateLimit('signup:192.168.1.1');
      resetRateLimit('signup:192.168.1.2');
    });
  });

  describe('resetRateLimit', () => {
    it('should clear rate limit for identifier', async () => {
      const identifier = 'test-reset';
      const config = { interval: 60 * 1000, maxAttempts: 2 };

      // Make 2 attempts
      await rateLimit(identifier, config);
      await rateLimit(identifier, config);

      // Third should be blocked
      const blocked = await rateLimit(identifier, config);
      expect(blocked.success).toBe(false);

      // Reset
      resetRateLimit(identifier);

      // Should be allowed now
      const allowed = await rateLimit(identifier, config);
      expect(allowed.success).toBe(true);
      expect(allowed.remaining).toBe(1);
    });
  });
});
