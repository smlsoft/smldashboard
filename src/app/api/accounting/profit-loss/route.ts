import { NextResponse } from 'next/server';
import { getProfitLossData } from '@/lib/data/accounting';
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

    const cachedQuery = createCachedQuery(
      () => getProfitLossData(dateRange),
      ['accounting', 'profit-loss', startDate, endDate],
      CacheDuration.MEDIUM
    );

    const data = await cachedQuery();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'GET /api/accounting/profit-loss');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
