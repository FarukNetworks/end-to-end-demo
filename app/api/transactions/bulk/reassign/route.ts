import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { bulkReassignSchema } from '@/lib/validators/transaction';
import { bulkReassignCategory } from '@/lib/queries/transactions';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

/**
 * POST /api/transactions/bulk/reassign
 * Bulk reassign transactions to a different category
 *
 * FR-015: Bulk category reassignment
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
    const { ids, categoryId } = bulkReassignSchema.parse(body);

    // Verify category belongs to user
    const category = await db.category.findFirst({
      where: { id: categoryId, userId: user.id },
    });

    if (!category) {
      logger.warn('Category not found or access denied', {
        route: '/api/transactions/bulk/reassign',
        method: 'POST',
        userId: user.id,
        categoryId,
      });

      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category not found',
          },
        },
        { status: 404 }
      );
    }

    // Type compatibility check: verify all transactions match category type
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
      select: {
        id: true,
        type: true,
      },
    });

    // Find transactions with mismatched types
    const incompatibleTxns = transactions.filter((txn) => txn.type !== category.type);

    if (incompatibleTxns.length > 0) {
      const incompatibleIds = incompatibleTxns.map((t) => t.id);

      logger.warn('Type mismatch in bulk reassignment', {
        route: '/api/transactions/bulk/reassign',
        method: 'POST',
        userId: user.id,
        categoryType: category.type,
        incompatibleCount: incompatibleTxns.length,
        incompatibleIds,
      });

      return NextResponse.json(
        {
          error: {
            code: 'TYPE_MISMATCH',
            message: `Transaction type must match category type (${category.type}). Incompatible transactions: ${incompatibleIds.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Reassign transactions (automatically scoped to userId)
    const updated = await bulkReassignCategory(user.id, ids, categoryId);

    const duration = Date.now() - startTime;

    logger.info('Bulk reassignment completed', {
      route: '/api/transactions/bulk/reassign',
      method: 'POST',
      userId: user.id,
      categoryId,
      requestedCount: ids.length,
      updatedCount: updated,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({
      updated,
      message: `${updated} transaction(s) reassigned`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Bulk reassignment validation error', {
        route: '/api/transactions/bulk/reassign',
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
      'Bulk reassignment internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/transactions/bulk/reassign',
        method: 'POST',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reassign transactions',
        },
      },
      { status: 500 }
    );
  }
}
