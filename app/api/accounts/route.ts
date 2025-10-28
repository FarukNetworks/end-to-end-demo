import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createAccountSchema } from '@/lib/validators/account';
import { getAccountsWithBalances } from '@/lib/queries/accounts';
import { ZodError } from 'zod';

/**
 * GET /api/accounts
 * Fetch all accounts with calculated balances for authenticated user
 *
 * FR-027: Accounts list with balances
 * US-011: See derived account balances
 */
export async function GET(_req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Fetch accounts with calculated balances
    const accountsWithBalances = await getAccountsWithBalances(user.id);

    const duration = Date.now() - startTime;

    logger.info('Accounts fetched successfully', {
      route: '/api/accounts',
      method: 'GET',
      userId: user.id,
      count: accountsWithBalances.length,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({ data: accountsWithBalances });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Accounts fetch internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/accounts',
        method: 'GET',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch accounts',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts
 * Create a new account
 *
 * FR-029: Create account
 * US-ACC-01: Track transactions across multiple accounts
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createAccountSchema.parse(body);

    // Check for duplicate name (case-insensitive)
    const existing = await db.account.findFirst({
      where: {
        userId: user.id,
        name: {
          equals: validatedData.name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      logger.warn('Duplicate account name', {
        route: '/api/accounts',
        method: 'POST',
        userId: user.id,
        name: validatedData.name,
      });

      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_NAME',
            message: 'Account name already exists',
          },
        },
        { status: 409 }
      );
    }

    // Create account
    const account = await db.account.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        color: validatedData.color || '#6b7280',
      },
    });

    const duration = Date.now() - startTime;

    logger.info('Account created successfully', {
      route: '/api/accounts',
      method: 'POST',
      userId: user.id,
      accountId: account.id,
      statusCode: 201,
      duration,
    });

    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Account validation error', {
        route: '/api/accounts',
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
      'Account creation internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/accounts',
        method: 'POST',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create account',
        },
      },
      { status: 500 }
    );
  }
}
