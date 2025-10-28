import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

/**
 * GET /api/reports/summary
 * Fetch summary KPIs with optional date range filtering
 *
 * FR-040: Dashboard KPIs
 * US-DASH-01: See total spending this month
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

    // Adjust 'to' date to end of day for inclusive filtering
    if (to) {
      to = new Date(to);
      to.setHours(23, 59, 59, 999);
    }

    // Build where clause for date filtering
    const whereClause: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

    if (from || to) {
      whereClause.txnDate = {};
      if (from) {
        whereClause.txnDate.gte = from;
      }
      if (to) {
        whereClause.txnDate.lte = to;
      }
    }

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where: whereClause,
      select: {
        amount: true,
        type: true,
      },
    });

    // Calculate KPIs
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const net = totalIncome - totalExpense;

    const duration = Date.now() - startTime;

    logger.info('Summary fetched successfully', {
      route: '/api/reports/summary',
      method: 'GET',
      userId: user.id,
      transactionCount: transactions.length,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      net: Number(net.toFixed(2)),
      transactionCount: transactions.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Summary fetch internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/reports/summary',
        method: 'GET',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch summary',
        },
      },
      { status: 500 }
    );
  }
}
