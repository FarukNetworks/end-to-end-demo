import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { TxnType, Prisma } from '@prisma/client';

/**
 * GET /api/reports/by-category
 * Aggregate transactions by category with totals and percentages
 *
 * FR-042: Category distribution reporting
 * US-DASH-02: View category breakdown chart
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
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    let to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;
    const type = searchParams.get('type') as TxnType | undefined;

    // Adjust 'to' date to end of day for inclusive filtering
    if (to) {
      to = new Date(to);
      to.setHours(23, 59, 59, 999);
    }

    // Validate type parameter if provided
    if (type && type !== 'expense' && type !== 'income') {
      logger.warn('Invalid type parameter', {
        route: '/api/reports/by-category',
        method: 'GET',
        userId: user.id,
        type,
        statusCode: 400,
      });

      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Type must be expense or income',
          },
        },
        { status: 400 }
      );
    }

    // Build where clause with proper date range handling
    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
      ...(type && { type }),
    };

    // Handle date range - merge gte and lte properly
    if (from || to) {
      where.txnDate = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    // Aggregate transactions by category
    const result = await db.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true,
      },
    });

    // Calculate total
    const total = result.reduce((sum, r) => sum + Number(r._sum.amount || 0), 0);

    // Fetch category details
    const categoryIds = result.map((r) => r.categoryId);
    const categories = await db.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });

    // Build response data with percentages
    const data = result.map((r) => {
      const category = categories.find((c) => c.id === r.categoryId);
      const amount = Number(r._sum.amount || 0);
      const percentage = total > 0 ? (amount / total) * 100 : 0;

      return {
        categoryId: r.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#6b7280',
        total: Number(amount.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
      };
    });

    // Sort by total descending
    data.sort((a, b) => b.total - a.total);

    const duration = Date.now() - startTime;

    logger.info('Category breakdown fetched successfully', {
      route: '/api/reports/by-category',
      method: 'GET',
      userId: user.id,
      categoryCount: data.length,
      total: Number(total.toFixed(2)),
      statusCode: 200,
      duration,
    });

    return NextResponse.json({
      data,
      total: Number(total.toFixed(2)),
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Category breakdown fetch internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/reports/by-category',
        method: 'GET',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch category breakdown',
        },
      },
      { status: 500 }
    );
  }
}
