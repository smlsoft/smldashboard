import { NextRequest, NextResponse } from 'next/server';
import { getOverstockItems } from '@/lib/data/inventory';
import { createCachedQuery, CacheDuration } from '@/lib/cache';
import { formatErrorResponse, logError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asOfDate = searchParams.get('as_of_date') || new Date().toISOString().split('T')[0];

    const cachedQuery = createCachedQuery(
      () => getOverstockItems(asOfDate),
      ['inventory', 'overstock', asOfDate],
      CacheDuration.SHORT
    );

    const data = await cachedQuery();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logError(error, 'GET /api/inventory/overstock');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
