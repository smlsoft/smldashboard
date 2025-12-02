/**
 * GET /api/sales-chart
 * ดึงข้อมูลกราฟยอดขาย 30 วันล่าสุด
 */

import { NextResponse } from 'next/server';
import { getSalesChartData } from '@/lib/data/dashboard';
import { createCachedQuery, CacheDuration } from '@/lib/cache';
import { formatErrorResponse, logError } from '@/lib/errors';

export async function GET() {
  try {
    const cachedQuery = createCachedQuery(
      async () => {
        return await getSalesChartData();
      },
      ['dashboard', 'sales-chart'],
      CacheDuration.MEDIUM // 5 minutes cache
    );

    const data = await cachedQuery();

    return NextResponse.json(data);
  } catch (error) {
    logError(error, 'GET /api/sales-chart');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
