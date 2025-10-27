/**
 * In-memory rate limiter for API endpoints
 * NF-013: Rate limiting specification
 *   - Login: 5 attempts per email per 15 minutes
 *   - Signup: 3 attempts per IP per hour
 *
 * Trade-off: Works for single-instance deployments.
 * Upgrade to Redis/Upstash for multi-instance horizontal scaling.
 */

import { LRUCache } from 'lru-cache';

type RateLimitConfig = {
  interval: number; // milliseconds
  maxAttempts: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

const tokenCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60 * 60 * 1000, // 1 hour
});

/**
 * Rate limit implementation using sliding window
 * @param identifier - Unique identifier (email for login, IP for signup)
 * @param config - Rate limit configuration (interval and maxAttempts)
 * @returns Result with success, remaining attempts, and reset timestamp
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.interval;

  // Get existing attempts
  const attempts = tokenCache.get(identifier) || [];

  // Filter attempts within window
  const recentAttempts = attempts.filter(time => time > windowStart);

  if (recentAttempts.length >= config.maxAttempts) {
    const oldestAttempt = Math.min(...recentAttempts);
    const resetTime = oldestAttempt + config.interval;

    return {
      success: false,
      remaining: 0,
      reset: resetTime,
    };
  }

  // Add new attempt
  recentAttempts.push(now);
  tokenCache.set(identifier, recentAttempts);

  return {
    success: true,
    remaining: config.maxAttempts - recentAttempts.length,
    reset: now + config.interval,
  };
}

/**
 * Pre-configured rate limiters for specific endpoints
 */
export const rateLimiters = {
  /**
   * Login rate limiter: 5 attempts per email per 15 minutes
   */
  login: (email: string) =>
    rateLimit(`login:${email.toLowerCase()}`, {
      interval: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
    }),

  /**
   * Signup rate limiter: 3 attempts per IP per hour
   */
  signup: (ip: string) =>
    rateLimit(`signup:${ip}`, {
      interval: 60 * 60 * 1000, // 1 hour
      maxAttempts: 3,
    }),
};

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  tokenCache.delete(identifier);
}
