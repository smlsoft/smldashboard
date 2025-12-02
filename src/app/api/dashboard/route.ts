/**
 * GET /api/dashboard
 * ดึงข้อมูล KPIs, Recent Sales, และ Alerts สำหรับหน้า Dashboard
 */

import { NextResponse } from 'next/server';
import { getDashboardKPIs, getRecentSales, getDashboardAlerts } from '@/lib/data/dashboard';
import { createCachedQuery, CacheDuration } from '@/lib/cache';
import { formatErrorResponse, logError } from '@/lib/errors';

export async function GET() {
  try {
    const cachedQuery = createCachedQuery(
      async () => {
        const [kpis, recentSales, alerts] = await Promise.all([
          getDashboardKPIs(),
          getRecentSales(),
          getDashboardAlerts(),
        ]);

        return {
          ...kpis,
          recentSales,
          alerts,
        };
      },
      ['dashboard', 'overview'],
      CacheDuration.SHORT // 1 minute cache
    );

    const data = await cachedQuery();

    return NextResponse.json(data);
  } catch (error) {
    logError(error, 'GET /api/dashboard');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
