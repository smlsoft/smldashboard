import { NextResponse } from 'next/server';
import { getRevenueBreakdown, getExpenseBreakdown } from '@/lib/data/accounting';
import { formatErrorResponse, logError } from '@/lib/errors';
import { createCachedQuery, CacheDuration } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    const dateRange = { start: startDate, end: endDate };

    const cachedRevenueQuery = createCachedQuery(
      () => getRevenueBreakdown(dateRange),
      ['accounting', 'revenue-breakdown', startDate, endDate],
      CacheDuration.MEDIUM
    );

    const cachedExpenseQuery = createCachedQuery(
      () => getExpenseBreakdown(dateRange),
      ['accounting', 'expense-breakdown', startDate, endDate],
      CacheDuration.MEDIUM
    );

    // Fetch both in parallel
    const [revenue, expenses] = await Promise.all([
      cachedRevenueQuery(),
      cachedExpenseQuery(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        expenses,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'GET /api/accounting/revenue-expense-breakdown');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
