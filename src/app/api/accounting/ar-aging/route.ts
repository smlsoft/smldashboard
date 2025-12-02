import { NextResponse } from 'next/server';
import { getARAgingData } from '@/lib/data/accounting';
import { formatErrorResponse, logError } from '@/lib/errors';
import { createCachedQuery, CacheDuration } from '@/lib/cache';

export async function GET() {
  try {
    const cachedQuery = createCachedQuery(
      () => getARAgingData(),
      ['accounting', 'ar-aging'],
      CacheDuration.SHORT // Cache for 1 minute (aging data changes frequently)
    );

    const data = await cachedQuery();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'GET /api/accounting/ar-aging');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
