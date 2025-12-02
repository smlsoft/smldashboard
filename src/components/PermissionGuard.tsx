'use client';

/**
 * Permission Guard Component
 * Component สำหรับควบคุมการแสดงผลตามสิทธิ์การเข้าถึง
 */

import { ReactNode } from 'react';
import { Lock, Eye } from 'lucide-react';
import { useComponentPermission } from '@/lib/permissions/PermissionContext';
import type { ComponentKey } from '@/lib/permissions/types';

interface PermissionGuardProps {
  /** Component Key ที่ต้องการตรวจสอบสิทธิ์ */
  componentKey: ComponentKey;
  /** เนื้อหาที่จะแสดงเมื่อมีสิทธิ์ */
  children: ReactNode;
  /** แสดง UI สำหรับ View-only mode หรือไม่ (default: false) */
  showViewOnly?: boolean;
  /** Custom message เมื่อไม่มีสิทธิ์ */
  deniedMessage?: string;
  /** แสดง Fallback UI เมื่อไม่มีสิทธิ์ หรือซ่อนทั้งหมด (default: show fallback) */
  hideDenied?: boolean;
}

/**
 * PermissionGuard Component
 * ใช้ครอบ Component ที่ต้องการควบคุมสิทธิ์การเข้าถึง
 *
 * @example
 * // แสดงเฉพาะเมื่อมีสิทธิ์
 * <PermissionGuard componentKey="sales.kpis">
 *   <KPICards />
 * </PermissionGuard>
 *
 * @example
 * // ซ่อนทั้งหมดเมื่อไม่มีสิทธิ์
 * <PermissionGuard componentKey="sales.top_customers" hideDenied>
 *   <TopCustomersTable />
 * </PermissionGuard>
 */
export function PermissionGuard({
  componentKey,
  children,
  showViewOnly = false,
  deniedMessage,
  hideDenied = false,
}: PermissionGuardProps) {
  const { allowed, level, reason } = useComponentPermission(componentKey);

  // ไม่มีสิทธิ์เลย
  if (!allowed) {
    if (hideDenied) {
      return null; // ซ่อนทั้งหมด
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-border">
        <Lock className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground text-center">
          {deniedMessage || reason || 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'}
        </p>
      </div>
    );
  }

  // มีสิทธิ์แบบ view-only
  if (level === 'view' && showViewOnly) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-600">
            <Eye className="h-3 w-3" />
            <span>ดูอย่างเดียว</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // มีสิทธิ์เต็ม หรือ view-only แต่ไม่แสดง badge
  return <>{children}</>;
}

/**
 * Quick Permission Check Component
 * แสดง/ซ่อน Component แบบง่ายๆ ไม่มี Fallback UI
 *
 * @example
 * <Show if="sales.kpis">
 *   <KPICards />
 * </Show>
 */
interface ShowProps {
  if: ComponentKey;
  children: ReactNode;
}

export function Show({ if: componentKey, children }: ShowProps) {
  const { allowed } = useComponentPermission(componentKey);
  return allowed ? <>{children}</> : null;
}

/**
 * Hide Component - ตรงกันข้ามกับ Show
 * แสดงเมื่อไม่มีสิทธิ์ ซ่อนเมื่อมีสิทธิ์
 *
 * @example
 * <Hide if="sales.kpis">
 *   <p>คุณไม่สามารถดูข้อมูลนี้ได้</p>
 * </Hide>
 */
interface HideProps {
  if: ComponentKey;
  children: ReactNode;
}

export function Hide({ if: componentKey, children }: HideProps) {
  const { allowed } = useComponentPermission(componentKey);
  return !allowed ? <>{children}</> : null;
}
