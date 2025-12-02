/**
 * GET /api/auth/permissions
 * ตรวจสอบสิทธิ์สำหรับ Component หรือ Module ที่ระบุ
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMockCurrentUser } from '@/lib/permissions';
import type { ComponentKey, Module } from '@/lib/permissions/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const componentKey = searchParams.get('component') as ComponentKey | null;
    const module = searchParams.get('module') as Module | null;

    // ดึงข้อมูล User
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

    // ตรวจสอบ Component Permission
    if (componentKey) {
      const moduleName = componentKey.split('.')[0] as Module;
      const modulePermission = user.role.permissions.find((p) => p.module === moduleName);

      if (!modulePermission) {
        return NextResponse.json({
          success: true,
          data: {
            allowed: false,
            level: 'none',
            reason: `No access to module: ${moduleName}`,
          },
        });
      }

      const componentLevel = modulePermission.components[componentKey];
      const level = componentLevel !== undefined ? componentLevel : modulePermission.level;

      return NextResponse.json({
        success: true,
        data: {
          allowed: level !== 'none',
          level,
        },
      });
    }

    // ตรวจสอบ Module Permission
    if (module) {
      const modulePermission = user.role.permissions.find((p) => p.module === module);

      if (!modulePermission) {
        return NextResponse.json({
          success: true,
          data: {
            allowed: false,
            level: 'none',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          allowed: modulePermission.level !== 'none',
          level: modulePermission.level,
        },
      });
    }

    // ไม่ได้ระบุ component หรือ module
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameter: component or module',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error checking permissions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check permissions',
      },
      { status: 500 }
    );
  }
}
