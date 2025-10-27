import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { signupSchema } from '@/lib/validators';
import { rateLimiters } from '@/lib/rate-limit';
import { createDefaultCategories } from '@/lib/seed/categories';
import { seedDefaultAccounts } from '@/lib/seed/accounts';
import { ZodError } from 'zod';

/**
 * POST /api/auth/signup
 * Create new user account with email/password
 *
 * FR-001, FR-002: User registration with email/password
 * NF-010: Password hashing with bcrypt (10 rounds)
 * NF-013: Rate limiting (3 signups per IP per hour)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Extract IP address for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Rate limiting: 3 signups per IP per hour
    const signupRateLimit = await rateLimiters.signup(ip);

    if (!signupRateLimit.success) {
      const retryAfter = Math.ceil((signupRateLimit.reset - Date.now()) / 1000);

      logger.warn('Signup rate limit exceeded', {
        route: '/api/auth/signup',
        ip,
        retryAfter,
      });

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

    // Parse and validate request body
    const body = await req.json();
    const validatedData = signupSchema.parse(body);
    const { email, password, name } = validatedData;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Signup attempt with existing email', {
        route: '/api/auth/signup',
        email,
      });

      return NextResponse.json(
        {
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds per NF-010)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default categories and accounts in transaction
    const user = await db.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      // Create default categories and accounts (no duplicates expected for new user)
      await createDefaultCategories(tx, newUser.id, false);
      await seedDefaultAccounts(tx, newUser.id, false);

      return newUser;
    });

    const duration = Date.now() - startTime;

    logger.info('User signup successful', {
      route: '/api/auth/signup',
      method: 'POST',
      userId: user.id,
      statusCode: 201,
      duration,
    });

    // Return user data (never include password hash)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Signup validation error', {
        route: '/api/auth/signup',
        method: 'POST',
        statusCode: 400,
        duration,
        errors: error.issues,
      });

      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: error.issues[0]?.message || 'Validation failed',
          },
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    logger.error(
      'Signup internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/auth/signup',
        method: 'POST',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Signup failed. Please try again later.',
        },
      },
      { status: 500 }
    );
  }
}
