import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/categories
 * Fetch all categories (system + custom) for authenticated user
 *
 * FR-017: Categories list
 * Returns categories ordered by type (expense first), then name
 * Includes transaction count for each category
 */
export async function GET(_req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // Fetch categories with transaction counts
    const categories = await db.category.findMany({
      where: { userId: user.id },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { txns: true },
        },
      },
    });

    const duration = Date.now() - startTime;

    logger.info('Categories fetched successfully', {
      route: '/api/categories',
      method: 'GET',
      userId: user.id,
      count: categories.length,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Categories fetch internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/categories',
        method: 'GET',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch categories',
        },
      },
      { status: 500 }
    );
  }
}
