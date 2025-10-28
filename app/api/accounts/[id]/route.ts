import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { updateAccountSchema } from '@/lib/validators/account';
import { ZodError } from 'zod';

/**
 * PATCH /api/accounts/:id
 * Update account name and/or color
 *
 * FR-030: Edit account (name and color only)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Await params (Next.js 15)
    const { id } = await params;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateAccountSchema.parse(body);

    const { name, color } = validatedData;

    // Verify ownership - account must belong to authenticated user
    const account = await db.account.findFirst({
      where: { id, userId: user.id },
    });

    if (!account) {
      logger.warn('Account not found or access denied', {
        route: `/api/accounts/${id}`,
        method: 'PATCH',
        userId: user.id,
        accountId: id,
      });

      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Account not found',
          },
        },
        { status: 404 }
      );
    }

    // Check duplicate name (only if name is being changed)
    if (name && name !== account.name) {
      const duplicate = await db.account.findFirst({
        where: {
          userId: user.id,
          name: { equals: name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicate) {
        logger.warn('Duplicate account name on update', {
          route: `/api/accounts/${id}`,
          method: 'PATCH',
          userId: user.id,
          name,
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
    }

    // Build update data (only include fields that are provided)
    const updateData: { name?: string; color?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    // Update account
    const updated = await db.account.update({
      where: { id },
      data: updateData,
    });

    const duration = Date.now() - startTime;

    logger.info('Account updated successfully', {
      route: `/api/accounts/${id}`,
      method: 'PATCH',
      userId: user.id,
      accountId: updated.id,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Account update validation error', {
        route: '/api/accounts/:id',
        method: 'PATCH',
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
      'Account update internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/accounts/:id',
        method: 'PATCH',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update account',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts/:id
 * Delete account with optional transaction reassignment
 *
 * FR-032: Delete with reassignment
 * FR-033: Check for linked transactions
 * FR-034: Atomic transaction reassignment
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Await params (Next.js 15)
    const { id } = await params;

    // Extract reassignTo from query params
    const { searchParams } = new URL(req.url);
    const reassignTo = searchParams.get('reassignTo');

    // Verify ownership and get transaction count
    const account = await db.account.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { txns: true } } },
    });

    if (!account) {
      logger.warn('Account not found or access denied', {
        route: `/api/accounts/${id}`,
        method: 'DELETE',
        userId: user.id,
        accountId: id,
      });

      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Account not found',
          },
        },
        { status: 404 }
      );
    }

    // Check for transactions
    if (account._count.txns > 0) {
      if (!reassignTo) {
        logger.warn('Account has transactions, reassignTo required', {
          route: `/api/accounts/${id}`,
          method: 'DELETE',
          userId: user.id,
          accountId: id,
          transactionCount: account._count.txns,
        });

        return NextResponse.json(
          {
            error: {
              code: 'HAS_TRANSACTIONS',
              message: 'Account has transactions. Provide reassignTo parameter.',
              details: { transactionCount: account._count.txns },
            },
          },
          { status: 400 }
        );
      }

      // Verify reassignTo account exists and belongs to user
      const targetAccount = await db.account.findFirst({
        where: { id: reassignTo, userId: user.id },
      });

      if (!targetAccount) {
        logger.warn('Target account not found for reassignment', {
          route: `/api/accounts/${id}`,
          method: 'DELETE',
          userId: user.id,
          accountId: id,
          reassignTo,
        });

        return NextResponse.json(
          {
            error: {
              code: 'INVALID_REASSIGN',
              message: 'Target account not found',
            },
          },
          { status: 404 }
        );
      }

      // Reassign transactions then delete account (atomic)
      await db.$transaction([
        db.transaction.updateMany({
          where: { accountId: id, userId: user.id },
          data: { accountId: reassignTo },
        }),
        db.account.delete({ where: { id } }),
      ]);

      const duration = Date.now() - startTime;

      logger.info('Account deleted with transaction reassignment', {
        route: `/api/accounts/${id}`,
        method: 'DELETE',
        userId: user.id,
        accountId: id,
        reassignTo,
        transactionCount: account._count.txns,
        statusCode: 204,
        duration,
      });
    } else {
      // No transactions, safe to delete
      await db.account.delete({ where: { id } });

      const duration = Date.now() - startTime;

      logger.info('Account deleted successfully', {
        route: `/api/accounts/${id}`,
        method: 'DELETE',
        userId: user.id,
        accountId: id,
        statusCode: 204,
        duration,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Account deletion internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/accounts/:id',
        method: 'DELETE',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete account',
        },
      },
      { status: 500 }
    );
  }
}
