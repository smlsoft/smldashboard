import { NextRequest, NextResponse } from 'next/server';
import { getSlowMovingItems } from '@/lib/data/inventory';
import { createCachedQuery, CacheDuration } from '@/lib/cache';
import { formatErrorResponse, logError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const asOfDate = searchParams.get('as_of_date') || new Date().toISOString().split('T')[0];

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: start_date, end_date' },
        { status: 400 }
      );
    }

    const cachedQuery = createCachedQuery(
      () => getSlowMovingItems({ start: startDate, end: endDate }, asOfDate),
      ['inventory', 'slow-moving', startDate, endDate, asOfDate],
      CacheDuration.MEDIUM
    );

    const data = await cachedQuery();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logError(error, 'GET /api/inventory/slow-moving');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
