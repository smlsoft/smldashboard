# 🔐 ระบบจัดการสิทธิ์การเข้าถึง (Permission System)

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [โครงสร้างไฟล์](#โครงสร้างไฟล์)
3. [Roles และ Permissions](#roles-และ-permissions)
4. [การใช้งาน](#การใช้งาน)
5. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
6. [การทดสอบ](#การทดสอบ)

---

## ภาพรวมระบบ

ระบบ Permission ของ Dashboard MIS ใช้หลักการ **Component-level Permission** ซึ่งสามารถควบคุมการแสดงผลของแต่ละ Component ตามสิทธิ์ของผู้ใช้ได้อย่างละเอียด

### คุณสมบัติหลัก

- ✅ **Component-level Permission**: ควบคุมสิทธิ์ทุก Component แยกกัน
- ✅ **3 ระดับสิทธิ์**: `none`, `view`, `full`
- ✅ **5 Roles พื้นฐาน**: Admin, Manager, Sales, Purchase, Accountant
- ✅ **React Context API**: จัดการ state แบบ global
- ✅ **Mock Data**: พร้อมข้อมูลทดสอบ
- ✅ **Easy to extend**: เพิ่ม Role หรือ Permission ใหม่ได้ง่าย

---

## โครงสร้างไฟล์

```
src/
├── lib/permissions/
│   ├── types.ts                    # TypeScript interfaces และ types
│   ├── mockData.ts                 # Mock roles และ users สำหรับทดสอบ
│   ├── PermissionContext.tsx       # React Context และ Hooks
│   └── index.ts                    # Barrel export
├── components/
│   └── PermissionGuard.tsx         # Component wrapper สำหรับควบคุมสิทธิ์
└── app/
    ├── layout.tsx                  # Root layout (มี PermissionProvider)
    └── api/auth/
        ├── user/route.ts           # API: ดึงข้อมูล user
        ├── permissions/route.ts    # API: ตรวจสอบสิทธิ์
        └── roles/route.ts          # API: ดึงรายการ roles
```

---

## Roles และ Permissions

### 1. Admin (ผู้ดูแลระบบ)
- **สิทธิ์**: เข้าถึงได้ทุก Module และทุก Component
- **Level**: `full` ทั้งหมด

### 2. Manager (ผู้จัดการ)
- **สิทธิ์**: เข้าถึงได้ทุก Module แต่เฉพาะ `view`
- **Level**: `view` ทั้งหมด

### 3. Sales (พนักงานขาย)
- **สิทธิ์**:
  - Sales Module: `full` (บางส่วน `view`)
  - Inventory Module: `view` (เฉพาะบางส่วน)
  - Accounting & Purchase: `none`

### 4. Purchase (พนักงานจัดซื้อ)
- **สิทธิ์**:
  - Purchase Module: `full`
  - Inventory Module: `full`
  - Accounting & Sales: `none`

### 5. Accountant (นักบัญชี)
- **สิทธิ์**:
  - Accounting Module: `full`
  - Sales, Purchase, Inventory: `view` (เฉพาะบางส่วน)

---

## การใช้งาน

### 1. Setup PermissionProvider

ใน `src/app/layout.tsx`:

```tsx
import { PermissionProvider } from '@/lib/permissions';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PermissionProvider>
          {/* Your app */}
          {children}
        </PermissionProvider>
      </body>
    </html>
  );
}
```

### 2. ใช้ PermissionGuard Component

ครอบ Component ที่ต้องการควบคุมสิทธิ์:

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';

function MyPage() {
  return (
    <div>
      <PermissionGuard componentKey="sales.kpis">
        <KPICards />
      </PermissionGuard>

      <PermissionGuard componentKey="sales.top_products">
        <TopProductsTable />
      </PermissionGuard>
    </div>
  );
}
```

### 3. ใช้ Hooks

```tsx
import { usePermissions, useComponentPermission, useModuleAccess } from '@/lib/permissions';

function MyComponent() {
  // ดึงข้อมูล user และฟังก์ชันตรวจสอบสิทธิ์
  const { user, checkPermission } = usePermissions();

  // ตรวจสอบสิทธิ์ component เฉพาะ
  const { allowed, level } = useComponentPermission('sales.kpis');

  // ตรวจสอบสิทธิ์ module
  const hasAccess = useModuleAccess('sales');

  return (
    <div>
      {allowed && <p>คุณมีสิทธิ์เข้าถึง</p>}
      {level === 'view' && <p>โหมดดูอย่างเดียว</p>}
      {hasAccess && <p>เข้าถึง Sales Module ได้</p>}
    </div>
  );
}
```

---

## ตัวอย่างการใช้งาน

### ตัวอย่าง 1: Sales Dashboard Page

```tsx
'use client';

import { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { KPICard } from '@/components/KPICard';
import { DataCard } from '@/components/DataCard';
// ... imports อื่นๆ

export default function SalesPage() {
  // ... states และ data fetching

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>ยอดขายและลูกค้า</h1>
      </div>

      {/* KPI Cards */}
      <PermissionGuard componentKey="sales.kpis">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="ยอดขายรวม" value={totalSales} />
          <KPICard title="กำไรขั้นต้น" value={grossProfit} />
          {/* ... */}
        </div>
      </PermissionGuard>

      {/* Sales Trend Chart */}
      <PermissionGuard componentKey="sales.trend">
        <DataCard title="แนวโน้มยอดขาย">
          <SalesTrendChart data={trendData} />
        </DataCard>
      </PermissionGuard>

      {/* Top Products */}
      <PermissionGuard componentKey="sales.top_products">
        <DataCard title="สินค้าขายดี Top 10">
          <TopProductsTable data={topProducts} />
        </DataCard>
      </PermissionGuard>

      {/* ... components อื่นๆ */}
    </div>
  );
}
```

### ตัวอย่าง 2: Show/Hide แบบง่าย

```tsx
import { Show, Hide } from '@/components/PermissionGuard';

function MyComponent() {
  return (
    <div>
      {/* แสดงเฉพาะเมื่อมีสิทธิ์ */}
      <Show if="sales.kpis">
        <KPICards />
      </Show>

      {/* แสดงเฉพาะเมื่อไม่มีสิทธิ์ */}
      <Hide if="sales.kpis">
        <p>คุณไม่สามารถดูข้อมูลนี้ได้</p>
      </Hide>
    </div>
  );
}
```

### ตัวอย่าง 3: ใช้ในเงื่อนไข

```tsx
import { useComponentPermission } from '@/lib/permissions';

function MyComponent() {
  const { allowed, level } = useComponentPermission('purchase.top_suppliers');

  if (!allowed) {
    return <p>ไม่มีสิทธิ์เข้าถึง</p>;
  }

  return (
    <div>
      <h2>Top Suppliers</h2>
      {level === 'view' && <Badge>View Only</Badge>}
      {level === 'full' && <Button>Add New</Button>}
    </div>
  );
}
```

---

## Component Keys ทั้งหมด

### Accounting Module
- `accounting.kpis` - KPI Cards
- `accounting.pl_statement` - P&L Statement
- `accounting.balance_sheet` - Balance Sheet
- `accounting.cash_flow` - Cash Flow
- `accounting.ar_aging` - AR Aging
- `accounting.ap_aging` - AP Aging
- `accounting.revenue_breakdown` - Revenue Breakdown
- `accounting.expense_breakdown` - Expense Breakdown

### Sales Module
- `sales.kpis` - KPI Cards
- `sales.trend` - Sales Trend Chart
- `sales.top_products` - Top Products Table
- `sales.by_branch` - Sales by Branch Chart
- `sales.by_salesperson` - Sales by Salesperson Table
- `sales.top_customers` - Top Customers Table
- `sales.ar_status` - AR Status Chart

### Purchase Module
- `purchase.kpis` - KPI Cards
- `purchase.trend` - Purchase Trend Chart
- `purchase.top_suppliers` - Top Suppliers Table
- `purchase.by_category` - Purchase by Category Chart
- `purchase.by_brand` - Purchase by Brand Chart
- `purchase.ap_outstanding` - AP Outstanding Table

### Inventory Module
- `inventory.kpis` - KPI Cards
- `inventory.stock_movement` - Stock Movement Chart
- `inventory.low_stock` - Low Stock Table
- `inventory.overstock` - Overstock Table
- `inventory.slow_moving` - Slow Moving Items Table
- `inventory.turnover` - Inventory Turnover Chart
- `inventory.by_branch` - Stock by Branch Chart

---

## การทดสอบ

### 1. ทดสอบด้วย Mock Users

ในไฟล์ `src/lib/permissions/mockData.ts` มี `getMockCurrentUser()` ที่ return **Manager Role** เป็นค่าเริ่มต้น

สามารถเปลี่ยน Role สำหรับทดสอบได้:

```typescript
// mockData.ts
export function getMockCurrentUser(): User {
  // เปลี่ยน index เพื่อทดสอบ Role ต่างๆ
  return mockUsers[0]; // Admin
  // return mockUsers[1]; // Manager
  // return mockUsers[2]; // Sales
  // return mockUsers[3]; // Purchase
  // return mockUsers[4]; // Accountant
}
```

### 2. ทดสอบผ่าน API

```bash
# ดึงข้อมูล user ปัจจุบัน
curl http://localhost:3000/api/auth/user

# ตรวจสอบสิทธิ์ component
curl http://localhost:3000/api/auth/permissions?component=sales.kpis

# ตรวจสอบสิทธิ์ module
curl http://localhost:3000/api/auth/permissions?module=sales

# ดึงรายการ roles ทั้งหมด
curl http://localhost:3000/api/auth/roles
```

### 3. ทดสอบแต่ละ Role

| Role | Login | ทดสอบอะไร |
|------|-------|----------|
| Admin | `admin` | เห็นทุกอย่าง, แก้ไขได้ทุกอย่าง |
| Manager | `manager` | เห็นทุกอย่างแต่แก้ไขไม่ได้ (view-only) |
| Sales | `sales01` | เห็นเฉพาะ Sales & Inventory บางส่วน |
| Purchase | `purchase01` | เห็นเฉพาะ Purchase & Inventory |
| Accountant | `accountant` | เห็นเฉพาะ Accounting และ financial data |

---

## การเพิ่ม Role หรือ Permission ใหม่

### เพิ่ม Role ใหม่

1. เปิดไฟล์ `src/lib/permissions/mockData.ts`
2. สร้าง Role object ใหม่:

```typescript
export const CustomRole: Role = {
  id: 'custom',
  name: 'Custom Role',
  description: 'คำอธิบาย Role นี้',
  permissions: [
    {
      module: 'sales',
      level: 'view',
      components: {
        'sales.kpis': 'view',
        'sales.trend': 'view',
        // ...
      },
    },
    // ... modules อื่นๆ
  ],
};
```

3. เพิ่มใน `mockUsers` array

### เพิ่ม Component Key ใหม่

1. เปิดไฟล์ `src/lib/permissions/types.ts`
2. เพิ่มใน `ComponentKey` type:

```typescript
export type ComponentKey =
  // ... existing keys
  | 'sales.new_component'
  | 'inventory.new_feature';
```

3. Update Role ที่ต้องการให้มีสิทธิ์เข้าถึง

---

## Best Practices

### 1. ใช้ PermissionGuard ครอบทุก Component ที่สำคัญ
```tsx
✅ Good
<PermissionGuard componentKey="sales.kpis">
  <KPICards />
</PermissionGuard>

❌ Bad
<KPICards /> // ไม่มีการตรวจสอบสิทธิ์
```

### 2. ใช้ ErrorBoundary ร่วมกับ PermissionGuard
```tsx
<PermissionGuard componentKey="sales.trend">
  <ErrorBoundary>
    <SalesTrendChart data={data} />
  </ErrorBoundary>
</PermissionGuard>
```

### 3. ใช้ `hideDenied` เมื่อต้องการซ่อนทั้งหมด
```tsx
<PermissionGuard componentKey="accounting.balance_sheet" hideDenied>
  <BalanceSheet />
</PermissionGuard>
```

### 4. ใช้ Hook เมื่อต้องการ Logic ที่ซับซ้อน
```tsx
const { allowed, level } = useComponentPermission('sales.top_customers');

if (!allowed) return null;

return (
  <div>
    <Table data={customers} />
    {level === 'full' && <Button>Export</Button>}
  </div>
);
```

---

## Troubleshooting

### ❓ Component ไม่แสดงผลแม้ว่าควรจะมีสิทธิ์

1. ตรวจสอบ Component Key ว่าตรงกับที่กำหนดใน `types.ts` หรือไม่
2. ตรวจสอบ Role ว่ามีการกำหนด permission สำหรับ component นี้หรือไม่
3. ตรวจสอบว่า `PermissionProvider` ครอบทั้งแอพหรือไม่

### ❓ Error: usePermissions must be used within a PermissionProvider

- ตรวจสอบว่า `<PermissionProvider>` อยู่ใน `layout.tsx` และครอบ `{children}` แล้วหรือไม่

### ❓ จะเปลี่ยน User สำหรับทดสอบได้อย่างไร

- แก้ไขใน `src/lib/permissions/mockData.ts` ฟังก์ชัน `getMockCurrentUser()`
- หรือสร้าง UI สำหรับ Switch User (แนะนำสำหรับ development)

---

## 📝 สรุป

ระบบ Permission ช่วยให้คุณ:
- ✅ ควบคุมการแสดงผลของแต่ละ Component ตามสิทธิ์ผู้ใช้
- ✅ จัดการ Role และ Permission แบบ centralized
- ✅ ทดสอบได้ง่ายด้วย Mock Data
- ✅ ขยายได้ง่ายเมื่อต้องการเพิ่ม Feature ใหม่

**Happy Coding! 🚀**
