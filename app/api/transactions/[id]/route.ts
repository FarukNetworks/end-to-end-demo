import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { deleteTransaction } from '@/lib/queries/transactions';
import { logger } from '@/lib/logger';

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 *
 * FR-013: Confirm transaction deletion
 * NF-003: API response time <500ms P95
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Delete transaction with user scoping
    const deleted = await deleteTransaction(user.id, id);

    if (!deleted) {
      const duration = Date.now() - startTime;
      logger.warn('Transaction not found or access denied', {
        route: '/api/transactions/:id',
        method: 'DELETE',
        userId: user.id,
        transactionId: id,
        statusCode: 404,
        duration,
      });

      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          },
        },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;

    logger.info('Transaction deleted successfully', {
      route: '/api/transactions/:id',
      method: 'DELETE',
      userId: user.id,
      transactionId: id,
      statusCode: 204,
      duration,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(
      'Transaction deletion internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/transactions/:id',
        method: 'DELETE',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete transaction',
        },
      },
      { status: 500 }
    );
  }
}
