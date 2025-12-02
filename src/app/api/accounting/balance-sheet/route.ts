import { NextResponse } from 'next/server';
import { getBalanceSheetData } from '@/lib/data/accounting';
import { formatErrorResponse, logError } from '@/lib/errors';
import { createCachedQuery, CacheDuration } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asOfDate = searchParams.get('as_of_date');

    if (!asOfDate) {
      return NextResponse.json(
        { error: 'as_of_date is required' },
        { status: 400 }
      );
    }

    const cachedQuery = createCachedQuery(
      () => getBalanceSheetData(asOfDate),
      ['accounting', 'balance-sheet', asOfDate],
      CacheDuration.MEDIUM
    );

    const data = await cachedQuery();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'GET /api/accounting/balance-sheet');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
