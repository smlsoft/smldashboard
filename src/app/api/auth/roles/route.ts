/**
 * GET /api/auth/roles
 * ดึงรายการ Roles ทั้งหมดในระบบ
 */

import { NextResponse } from 'next/server';
import { AdminRole, ManagerRole, SalesRole, PurchaseRole, AccountantRole } from '@/lib/permissions';

export async function GET() {
  try {
    // ในโปรเจคจริง จะดึงจาก Database
    // ตอนนี้ใช้ Mock Data
    const roles = [AdminRole, ManagerRole, SalesRole, PurchaseRole, AccountantRole];

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch roles',
      },
      { status: 500 }
    );
  }
}
