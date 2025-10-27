import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { createTransactionSchema, transactionFiltersSchema } from '@/lib/validators/transaction';
import { getTransactions } from '@/lib/queries/transactions';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

/**
 * GET /api/transactions
 * Fetch transactions with optional filters
 *
 * FR-007: List transactions
 * FR-016: Transaction filtering
 * NF-003: API response time <500ms P95
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const filters = {
      from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      accountId: searchParams.get('accountId') || undefined,
      type: searchParams.get('type') || undefined,
      q: searchParams.get('q') || undefined,
    };

    // Validate filters
    const validatedFilters = transactionFiltersSchema.parse(filters);

    // Fetch transactions
    const result = await getTransactions(user.id, validatedFilters);

    const duration = Date.now() - startTime;

    logger.info('Transactions fetched successfully', {
      route: '/api/transactions',
      method: 'GET',
      userId: user.id,
      count: result.transactions.length,
      total: result.total,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({
      data: result.transactions,
      total: result.total,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Transaction filter validation error', {
        route: '/api/transactions',
        method: 'GET',
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
      'Transaction fetch internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/transactions',
        method: 'GET',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch transactions',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Create a new transaction
 *
 * FR-008: Transaction creation requirements
 * FR-009: Transaction validation (type match, ownership)
 * NF-003: API response time <500ms P95
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createTransactionSchema.parse(body);

    // Verify category belongs to user and type matches
    const category = await db.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      logger.warn('Category not found or access denied', {
        route: '/api/transactions',
        method: 'POST',
        userId: user.id,
        categoryId: validatedData.categoryId,
      });

      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    if (category.type !== validatedData.type) {
      logger.warn('Transaction type mismatch with category type', {
        route: '/api/transactions',
        method: 'POST',
        userId: user.id,
        categoryType: category.type,
        transactionType: validatedData.type,
      });

      return NextResponse.json(
        {
          error: {
            code: 'TYPE_MISMATCH',
            message: `Transaction type must match category type (${category.type})`,
          },
        },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await db.account.findFirst({
      where: {
        id: validatedData.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      logger.warn('Account not found or access denied', {
        route: '/api/transactions',
        method: 'POST',
        userId: user.id,
        accountId: validatedData.accountId,
      });

      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ACCOUNT',
            message: 'Account not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        amount: validatedData.amount,
        currency: 'EUR',
        type: validatedData.type,
        categoryId: validatedData.categoryId,
        accountId: validatedData.accountId,
        txnDate: validatedData.txnDate,
        note: validatedData.note || null,
        tags: validatedData.tags || [],
      },
      include: {
        category: {
          select: { name: true, color: true },
        },
        account: {
          select: { name: true },
        },
      },
    });

    const duration = Date.now() - startTime;

    logger.info('Transaction created successfully', {
      route: '/api/transactions',
      method: 'POST',
      userId: user.id,
      transactionId: transaction.id,
      statusCode: 201,
      duration,
    });

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Transaction validation error', {
        route: '/api/transactions',
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
      'Transaction creation internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/transactions',
        method: 'POST',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create transaction',
        },
      },
      { status: 500 }
    );
  }
}
