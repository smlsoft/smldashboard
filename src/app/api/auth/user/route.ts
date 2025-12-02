/**
 * GET /api/auth/user
 * ดึงข้อมูล User ที่ล็อกอินอยู่พร้อม Role และ Permissions
 */

import { NextResponse } from 'next/server';
import { getMockCurrentUser } from '@/lib/permissions';

export async function GET() {
  try {
    // ในโปรเจคจริง จะตรวจสอบ Session/Token และดึงข้อมูลจาก Database
    // ตอนนี้ใช้ Mock Data
    const user = getMockCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not authenticated',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}
