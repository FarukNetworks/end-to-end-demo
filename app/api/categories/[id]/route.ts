import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { updateCategorySchema } from '@/lib/validators/category';
import { ZodError } from 'zod';

/**
 * PATCH /api/categories/:id
 * Update category name and/or color
 *
 * FR-021: Edit category
 * FR-020: Unique name validation (case-insensitive)
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
    const validatedData = updateCategorySchema.parse(body);

    const { name, color } = validatedData;

    // Verify ownership - category must belong to authenticated user
    const category = await db.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!category) {
      logger.warn('Category not found or access denied', {
        route: `/api/categories/${id}`,
        method: 'PATCH',
        userId: user.id,
        categoryId: id,
      });

      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        },
        { status: 404 }
      );
    }

    // Check duplicate name (only if name is being changed)
    if (name && name !== category.name) {
      const duplicate = await db.category.findFirst({
        where: {
          userId: user.id,
          name: { equals: name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicate) {
        logger.warn('Duplicate category name on update', {
          route: `/api/categories/${id}`,
          method: 'PATCH',
          userId: user.id,
          name,
        });

        return NextResponse.json(
          {
            error: {
              code: 'DUPLICATE_NAME',
              message: 'Category name already exists',
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

    // Update category
    const updated = await db.category.update({
      where: { id },
      data: updateData,
    });

    const duration = Date.now() - startTime;

    logger.info('Category updated successfully', {
      route: `/api/categories/${id}`,
      method: 'PATCH',
      userId: user.id,
      categoryId: updated.id,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Category update validation error', {
        route: '/api/categories/:id',
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
      'Category update internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/categories/:id',
        method: 'PATCH',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update category',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/:id
 * Delete category with optional transaction reassignment
 *
 * FR-023: Delete with reassignment
 * FR-024: System category protection
 * FR-025: Transaction reassignment validation
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
    const category = await db.category.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { txns: true } } },
    });

    if (!category) {
      logger.warn('Category not found or access denied', {
        route: `/api/categories/${id}`,
        method: 'DELETE',
        userId: user.id,
        categoryId: id,
      });

      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        },
        { status: 404 }
      );
    }

    // Prevent system category deletion
    if (category.isSystem) {
      logger.warn('Attempted to delete system category', {
        route: `/api/categories/${id}`,
        method: 'DELETE',
        userId: user.id,
        categoryId: id,
      });

      return NextResponse.json(
        {
          error: {
            code: 'SYSTEM_CATEGORY',
            message: 'Cannot delete system category',
          },
        },
        { status: 400 }
      );
    }

    // Check for transactions
    if (category._count.txns > 0) {
      if (!reassignTo) {
        logger.warn('Category has transactions, reassignTo required', {
          route: `/api/categories/${id}`,
          method: 'DELETE',
          userId: user.id,
          categoryId: id,
          transactionCount: category._count.txns,
        });

        return NextResponse.json(
          {
            error: {
              code: 'HAS_TRANSACTIONS',
              message: 'Category has transactions. Provide reassignTo parameter.',
              details: { transactionCount: category._count.txns },
            },
          },
          { status: 400 }
        );
      }

      // Verify reassignTo category exists and belongs to user
      const targetCategory = await db.category.findFirst({
        where: { id: reassignTo, userId: user.id },
      });

      if (!targetCategory) {
        logger.warn('Target category not found for reassignment', {
          route: `/api/categories/${id}`,
          method: 'DELETE',
          userId: user.id,
          categoryId: id,
          reassignTo,
        });

        return NextResponse.json(
          {
            error: {
              code: 'INVALID_REASSIGN',
              message: 'Target category not found',
            },
          },
          { status: 404 }
        );
      }

      // Reassign transactions then delete category (atomic)
      await db.$transaction([
        db.transaction.updateMany({
          where: { categoryId: id, userId: user.id },
          data: { categoryId: reassignTo },
        }),
        db.category.delete({ where: { id } }),
      ]);

      const duration = Date.now() - startTime;

      logger.info('Category deleted with transaction reassignment', {
        route: `/api/categories/${id}`,
        method: 'DELETE',
        userId: user.id,
        categoryId: id,
        reassignTo,
        transactionCount: category._count.txns,
        statusCode: 204,
        duration,
      });
    } else {
      // No transactions, safe to delete
      await db.category.delete({ where: { id } });

      const duration = Date.now() - startTime;

      logger.info('Category deleted successfully', {
        route: `/api/categories/${id}`,
        method: 'DELETE',
        userId: user.id,
        categoryId: id,
        statusCode: 204,
        duration,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Category deletion internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/categories/:id',
        method: 'DELETE',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete category',
        },
      },
      { status: 500 }
    );
  }
}
