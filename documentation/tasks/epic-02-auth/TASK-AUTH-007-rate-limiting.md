# TASK-AUTH-007 - Implement Rate Limiting Middleware

## Context & Goal

**Business Value:** Protect authentication endpoints from brute-force attacks and abuse (NF-013)  
**Epic:** EPIC-02 Authentication & User Management  
**PRD Reference:** NF-013 (Rate limiting: 5 login attempts, 3 signup attempts)

## Scope Definition

**✅ In Scope:**

- Rate limiting middleware using in-memory store (development)
- Redis-based rate limiting (production)
- Login rate limit: 5 attempts per email per 15 minutes
- Signup rate limit: 3 attempts per IP per hour
- 429 Too Many Requests response
- Retry-After header
- Rate limit reset logic

**⛔ Out of Scope:**

- Distributed rate limiting (V2)
- CAPTCHA integration (V1.1)
- IP geolocation blocking (V2)

## Technical Specifications

**Implementation Details:**

- Install rate limiting library:

  ```bash
  npm install @upstash/ratelimit @upstash/redis
  # OR for simple in-memory (dev)
  npm install lru-cache
  ```

- Create rate limiter in `/lib/rate-limit.ts`:

  ```typescript
  import { LRUCache } from 'lru-cache';

  type RateLimitConfig = {
    interval: number; // milliseconds
    maxAttempts: number;
  };

  const tokenCache = new LRUCache<string, number[]>({
    max: 500,
    ttl: 60 * 60 * 1000, // 1 hour
  });

  export async function rateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
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

  export const rateLimiters = {
    login: (email: string) =>
      rateLimit(`login:${email.toLowerCase()}`, {
        interval: 15 * 60 * 1000, // 15 minutes
        maxAttempts: 5,
      }),

    signup: (ip: string) =>
      rateLimit(`signup:${ip}`, {
        interval: 60 * 60 * 1000, // 1 hour
        maxAttempts: 3,
      }),
  };
  ```

- Update login endpoint in `/lib/auth.ts` authorize callback:

  ```typescript
  import { rateLimiters } from '@/lib/rate-limit';

  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Invalid credentials');
    }

    // Rate limiting
    const loginRateLimit = await rateLimiters.login(credentials.email);

    if (!loginRateLimit.success) {
      const retryAfter = Math.ceil(
        (loginRateLimit.reset - Date.now()) / 1000
      );
      throw new Error(
        `Too many login attempts. Try again in ${retryAfter} seconds.`
      );
    }

    // ... rest of authorize logic
  }
  ```

- Update signup endpoint in `/app/api/auth/signup/route.ts`:

  ```typescript
  import { rateLimiters } from '@/lib/rate-limit';

  export async function POST(req: Request) {
    try {
      // Get IP address
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'unknown';

      // Rate limiting
      const signupRateLimit = await rateLimiters.signup(ip);

      if (!signupRateLimit.success) {
        const retryAfter = Math.ceil(
          (signupRateLimit.reset - Date.now()) / 1000
        );

        return NextResponse.json(
          {
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Too many signup attempts. Try again in ${retryAfter} seconds.`,
            },
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
            },
          }
        );
      }

      // ... rest of signup logic
    } catch (error) {
      // ... error handling
    }
  }
  ```

**Architecture References:**

- PRD NF-013: Rate limiting specification
- OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html

## Acceptance Criteria

1. **Given** 4 failed login attempts for email
   **When** 5th attempt within 15 minutes
   **Then** return error "Too many login attempts. Try again in X seconds."

2. **Given** rate limit exceeded
   **When** checking response headers
   **Then** Retry-After header present with seconds until reset

3. **Given** 2 signup attempts from same IP
   **When** 3rd attempt within 1 hour
   **Then** return 429 Too Many Requests

4. **Given** rate limit exceeded then wait expires
   **When** attempting again after reset time
   **Then** request succeeds (limit reset)

5. **Given** successful login
   **When** checking rate limit state
   **Then** attempt count increments but under threshold

## Definition of Done

- [ ] Rate limiting library installed (lru-cache or @upstash/ratelimit)
- [ ] rateLimit utility function created
- [ ] Login rate limiter configured (5 per 15 min)
- [ ] Signup rate limiter configured (3 per hour)
- [ ] Rate limiting integrated in login endpoint
- [ ] Rate limiting integrated in signup endpoint
- [ ] 429 responses with Retry-After header
- [ ] User-friendly error messages
- [ ] Unit tests for rate limit logic
- [ ] Integration tests for rate limiting
- [ ] Documentation updated with rate limit specifications

## Dependencies

**Upstream Tasks:**

- TASK-AUTH-001 (Signup endpoint)
- TASK-AUTH-002 (Login endpoint)

**External Dependencies:** lru-cache OR @upstash/ratelimit + @upstash/redis  
**Parallel Tasks:** TASK-AUTH-008 (User scoping)  
**Downstream Impact:** Authentication endpoints protected

## Resources & References

**Design Assets:** N/A (security feature)  
**Technical Docs:**

- LRU Cache: https://www.npmjs.com/package/lru-cache
- Upstash Rate Limit: https://github.com/upstash/ratelimit

**PRD References:** NF-013, Section 12 (Security)  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 4 story points (5-7 hours)

- Rate limit utility: 2 hours
- Login integration: 1 hour
- Signup integration: 1 hour
- Testing: 2 hours

**Priority:** P0 (Must-have - security requirement)  
**Risk Level:** Medium (security-critical)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead - security review)  
**QA Owner:** TBD (Security testing)  
**Stakeholder:** Engineering Lead
