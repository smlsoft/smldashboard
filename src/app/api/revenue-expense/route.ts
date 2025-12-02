/**
 * GET /api/revenue-expense
 * ดึงข้อมูลรายได้ vs ค่าใช้จ่าย 12 เดือนล่าสุด
 */

import { NextResponse } from 'next/server';
import { getRevenueExpenseData } from '@/lib/data/dashboard';
import { createCachedQuery, CacheDuration } from '@/lib/cache';
import { formatErrorResponse, logError } from '@/lib/errors';

export async function GET() {
  try {
    const cachedQuery = createCachedQuery(
      async () => {
        return await getRevenueExpenseData();
      },
      ['dashboard', 'revenue-expense'],
      CacheDuration.LONG // 10 minutes cache
    );

    const data = await cachedQuery();

    return NextResponse.json(data);
  } catch (error) {
    logError(error, 'GET /api/revenue-expense');
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
