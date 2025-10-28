import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/reports/cashflow
 * Fetch monthly cash-flow data with income, expense, and net calculations
 *
 * FR-044: Cash-flow line chart
 * US-DASH-03: See monthly cash-flow over time
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
    const startParam = searchParams.get('start'); // YYYY-MM
    const months = parseInt(searchParams.get('months') || '6');

    // Calculate start date (using UTC to avoid timezone issues)
    // If startParam is provided, parse it; otherwise default to 6 months ago
    let startYear: number;
    let startMonth: number;

    if (startParam) {
      const [year, month] = startParam.split('-').map(Number);
      startYear = year;
      startMonth = month - 1; // month is 0-indexed
    } else {
      const now = new Date();
      startYear = now.getFullYear();
      startMonth = now.getMonth() - months + 1;

      // Handle negative months (wrap to previous year)
      while (startMonth < 0) {
        startMonth += 12;
        startYear -= 1;
      }
    }

    const data = [];

    // Loop through each month and calculate income/expense/net
    for (let i = 0; i < months; i++) {
      const currentYear = startYear + Math.floor((startMonth + i) / 12);
      const currentMonth = (startMonth + i) % 12;

      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

      // Fetch transactions for this month
      const transactions = await db.transaction.findMany({
        where: {
          userId: user.id,
          txnDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { amount: true, type: true },
      });

      // Calculate income and expense
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Add data point for this month
      // Format month as YYYY-MM (pad month with leading zero)
      const monthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

      data.push({
        month: monthString,
        income: Number(income.toFixed(2)),
        expense: Number(expense.toFixed(2)),
        net: Number((income - expense).toFixed(2)),
      });
    }

    const duration = Date.now() - startTime;

    logger.info('Cashflow fetched successfully', {
      route: '/api/reports/cashflow',
      method: 'GET',
      userId: user.id,
      monthsCount: data.length,
      statusCode: 200,
      duration,
    });

    return NextResponse.json({ data });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle unexpected errors
    logger.error(
      'Cashflow fetch internal error',
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/api/reports/cashflow',
        method: 'GET',
        statusCode: 500,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch cashflow',
        },
      },
      { status: 500 }
    );
  }
}
