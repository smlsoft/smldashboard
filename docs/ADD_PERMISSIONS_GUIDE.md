# 📝 คู่มือเพิ่ม Permission Guard ใน Dashboard Pages

## ขั้นตอนการเพิ่ม PermissionGuard ใน Accounting, Purchase, และ Inventory Pages

ตัวอย่างนี้จะแสดงวิธีเพิ่ม `PermissionGuard` ใน Dashboard Pages ที่เหลือ โดยใช้ **Sales Page เป็นตัวอย่างอ้างอิง**

---

## 🎯 ขั้นตอนที่ 1: เพิ่ม Import

เปิดไฟล์ที่ต้องการแก้ไข แล้วเพิ่ม import:

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';
```

### ตัวอย่าง

**ก่อน:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import { DataCard } from '@/components/DataCard';
// ...
```

**หลัง:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import { DataCard } from '@/components/DataCard';
import { PermissionGuard } from '@/components/PermissionGuard'; // ← เพิ่มบรรทัดนี้
// ...
```

---

## 🎯 ขั้นตอนที่ 2: ครอบ KPI Cards

หา section ที่แสดง KPI Cards แล้วครอบด้วย `PermissionGuard`:

```tsx
<PermissionGuard componentKey="MODULE.kpis">
  {/* KPI Cards content */}
</PermissionGuard>
```

### ตัวอย่าง - Accounting Page

```tsx
{/* KPI Cards */}
<PermissionGuard componentKey="accounting.kpis">
  {loading ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  ) : kpis ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard title="..." value={...} />
      {/* ... more KPI cards */}
    </div>
  ) : null}
</PermissionGuard>
```

---

## 🎯 ขั้นตอนที่ 3: ครอบ Charts และ Tables

ครอบแต่ละ Component ด้วย `PermissionGuard` ตาม Component Key ที่กำหนด:

### Accounting Page Components

```tsx
{/* P&L Statement */}
<PermissionGuard componentKey="accounting.pl_statement">
  <ErrorBoundary>
    <DataCard title="งบกำไรขาดทุน">
      {loading ? <ChartSkeleton /> : <PLChart data={plData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Balance Sheet */}
<PermissionGuard componentKey="accounting.balance_sheet">
  <ErrorBoundary>
    <DataCard title="งบดุล">
      {loading ? <ChartSkeleton /> : <BalanceSheetChart data={bsData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Cash Flow */}
<PermissionGuard componentKey="accounting.cash_flow">
  <ErrorBoundary>
    <DataCard title="กระแสเงินสด">
      {loading ? <ChartSkeleton /> : <CashFlowChart data={cfData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* AR Aging */}
<PermissionGuard componentKey="accounting.ar_aging">
  <ErrorBoundary>
    <DataCard title="อายุลูกหนี้">
      {loading ? <TableSkeleton /> : <ARAgingTable data={arData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* AP Aging */}
<PermissionGuard componentKey="accounting.ap_aging">
  <ErrorBoundary>
    <DataCard title="อายุเจ้าหนี้">
      {loading ? <TableSkeleton /> : <APAgingTable data={apData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Revenue Breakdown */}
<PermissionGuard componentKey="accounting.revenue_breakdown">
  <ErrorBoundary>
    <DataCard title="รายได้แยกตามประเภท">
      {loading ? <ChartSkeleton /> : <RevenueChart data={revenueData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Expense Breakdown */}
<PermissionGuard componentKey="accounting.expense_breakdown">
  <ErrorBoundary>
    <DataCard title="ค่าใช้จ่ายแยกตามประเภท">
      {loading ? <ChartSkeleton /> : <ExpenseChart data={expenseData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>
```

### Purchase Page Components

```tsx
{/* KPIs */}
<PermissionGuard componentKey="purchase.kpis">
  {/* ... KPI cards ... */}
</PermissionGuard>

{/* Purchase Trend */}
<PermissionGuard componentKey="purchase.trend">
  <ErrorBoundary>
    <DataCard title="แนวโน้มการจัดซื้อ">
      {loading ? <ChartSkeleton /> : <PurchaseTrendChart data={trendData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Top Suppliers */}
<PermissionGuard componentKey="purchase.top_suppliers">
  <ErrorBoundary>
    <DataCard title="ซัพพลายเออร์หลัก">
      {loading ? <TableSkeleton /> : <TopSuppliersTable data={suppliersData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* By Category */}
<PermissionGuard componentKey="purchase.by_category">
  <ErrorBoundary>
    <DataCard title="การซื้อตามหมวดสินค้า">
      {loading ? <ChartSkeleton /> : <PurchaseByCategoryChart data={categoryData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* By Brand */}
<PermissionGuard componentKey="purchase.by_brand">
  <ErrorBoundary>
    <DataCard title="การซื้อตามแบรนด์">
      {loading ? <ChartSkeleton /> : <PurchaseByBrandChart data={brandData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* AP Outstanding */}
<PermissionGuard componentKey="purchase.ap_outstanding">
  <ErrorBoundary>
    <DataCard title="เจ้าหนี้คงค้าง">
      {loading ? <TableSkeleton /> : <APOutstandingTable data={apData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>
```

### Inventory Page Components

```tsx
{/* KPIs */}
<PermissionGuard componentKey="inventory.kpis">
  {/* ... KPI cards ... */}
</PermissionGuard>

{/* Stock Movement */}
<PermissionGuard componentKey="inventory.stock_movement">
  <ErrorBoundary>
    <DataCard title="การเคลื่อนไหวสต็อก">
      {loading ? <ChartSkeleton /> : <StockMovementChart data={movementData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Low Stock & Overstock - ใช้ในแนวนอน */}
<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
  <PermissionGuard componentKey="inventory.low_stock">
    <ErrorBoundary>
      <DataCard title="สินค้าใกล้หมด">
        {loading ? <TableSkeleton /> : <LowStockTable data={lowStockData} />}
      </DataCard>
    </ErrorBoundary>
  </PermissionGuard>

  <PermissionGuard componentKey="inventory.overstock">
    <ErrorBoundary>
      <DataCard title="สินค้าเกินคลัง">
        {loading ? <TableSkeleton /> : <OverstockTable data={overstockData} />}
      </DataCard>
    </ErrorBoundary>
  </PermissionGuard>
</div>

{/* Slow Moving */}
<PermissionGuard componentKey="inventory.slow_moving">
  <ErrorBoundary>
    <DataCard title="สินค้าหมุนเวียนช้า">
      {loading ? <TableSkeleton /> : <SlowMovingTable data={slowMovingData} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>

{/* Turnover & By Branch - ใช้ในแนวนอน */}
<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
  <PermissionGuard componentKey="inventory.turnover">
    <ErrorBoundary>
      <DataCard title="อัตราหมุนเวียนสินค้า">
        {loading ? <ChartSkeleton /> : <InventoryTurnoverChart data={turnoverData} />}
      </DataCard>
    </ErrorBoundary>
  </PermissionGuard>

  <PermissionGuard componentKey="inventory.by_branch">
    <ErrorBoundary>
      <DataCard title="สต็อกแยกตามสาขา">
        {loading ? <ChartSkeleton /> : <StockByBranchChart data={branchData} />}
      </DataCard>
    </ErrorBoundary>
  </PermissionGuard>
</div>
```

---

## 📋 Component Key Reference

ใช้ Component Key ตามตารางนี้:

| Module | Component | Key |
|--------|-----------|-----|
| **Accounting** | KPIs | `accounting.kpis` |
| | P&L Statement | `accounting.pl_statement` |
| | Balance Sheet | `accounting.balance_sheet` |
| | Cash Flow | `accounting.cash_flow` |
| | AR Aging | `accounting.ar_aging` |
| | AP Aging | `accounting.ap_aging` |
| | Revenue Breakdown | `accounting.revenue_breakdown` |
| | Expense Breakdown | `accounting.expense_breakdown` |
| **Sales** | KPIs | `sales.kpis` |
| | Trend Chart | `sales.trend` |
| | Top Products | `sales.top_products` |
| | By Branch | `sales.by_branch` |
| | By Salesperson | `sales.by_salesperson` |
| | Top Customers | `sales.top_customers` |
| | AR Status | `sales.ar_status` |
| **Purchase** | KPIs | `purchase.kpis` |
| | Trend Chart | `purchase.trend` |
| | Top Suppliers | `purchase.top_suppliers` |
| | By Category | `purchase.by_category` |
| | By Brand | `purchase.by_brand` |
| | AP Outstanding | `purchase.ap_outstanding` |
| **Inventory** | KPIs | `inventory.kpis` |
| | Stock Movement | `inventory.stock_movement` |
| | Low Stock | `inventory.low_stock` |
| | Overstock | `inventory.overstock` |
| | Slow Moving | `inventory.slow_moving` |
| | Turnover | `inventory.turnover` |
| | By Branch | `inventory.by_branch` |

---

## 🔧 Tips

### 1. หาจุดที่ต้องเพิ่ม Permission
- มองหา `<ErrorBoundary>` หรือ `<DataCard>`
- มองหา comment sections เช่น `{/* KPI Cards */}` หรือ `{/* Chart Title */}`

### 2. Pattern ที่ใช้บ่อย

**Pattern 1: Single Component**
```tsx
<PermissionGuard componentKey="xxx.yyy">
  <ErrorBoundary>
    <DataCard title="...">
      {loading ? <Skeleton /> : <Component data={data} />}
    </DataCard>
  </ErrorBoundary>
</PermissionGuard>
```

**Pattern 2: Grid Layout (2 คอลัมน์)**
```tsx
<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
  <PermissionGuard componentKey="xxx.aaa">
    <ErrorBoundary>
      <DataCard title="...">
        <ComponentA />
      </DataCard>
    </ErrorBoundary>
  </PermissionGuard>

  <PermissionGuard componentKey="xxx.bbb">
    <ErrorBoundary>
      <DataCard title="...">
        <ComponentB />
      </DataCard>
    </ErrorBoundary>
  </PermissionGuard>
</div>
```

**Pattern 3: KPI Cards**
```tsx
<PermissionGuard componentKey="xxx.kpis">
  {loading ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  ) : kpis ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard title="..." value={...} />
      <KPICard title="..." value={...} />
      <KPICard title="..." value={...} />
      <KPICard title="..." value={...} />
    </div>
  ) : null}
</PermissionGuard>
```

### 3. ใช้ VS Code Find & Replace

1. เปิดไฟล์ที่ต้องการแก้
2. กด `Cmd/Ctrl + F`
3. ค้นหา: `<ErrorBoundary>`
4. ดูว่า Section นั้นเป็น Component อะไร
5. เพิ่ม `<PermissionGuard componentKey="...">` ก่อน `<ErrorBoundary>`
6. เพิ่ม `</PermissionGuard>` หลัง `</ErrorBoundary>`

---

## ✅ Checklist

เมื่อแก้ไขแต่ละ Page เสร็จแล้ว ตรวจสอบ:

- [ ] เพิ่ม `import { PermissionGuard } from '@/components/PermissionGuard';` แล้ว
- [ ] ครอบ KPI Cards ด้วย `PermissionGuard` แล้ว
- [ ] ครอบ Charts ทั้งหมดแล้ว
- [ ] ครอบ Tables ทั้งหมดแล้ว
- [ ] ใช้ Component Key ที่ถูกต้อง
- [ ] ไม่มี Syntax Error
- [ ] ลอง compile ดู (`npm run dev`)

---

## 🧪 การทดสอบ

หลังจากเพิ่ม Permission แล้ว:

1. เปิดไฟล์ `src/lib/permissions/mockData.ts`
2. แก้ `getMockCurrentUser()` ให้ return Role ต่างๆ:
   ```typescript
   // ทดสอบแต่ละ Role
   return mockUsers[0]; // Admin - เห็นทุกอย่าง
   return mockUsers[1]; // Manager - เห็นทุกอย่างแต่ view-only
   return mockUsers[2]; // Sales - เห็นเฉพาะ Sales + บางส่วนของ Inventory
   return mockUsers[3]; // Purchase - เห็นเฉพาะ Purchase + Inventory
   return mockUsers[4]; // Accountant - เห็นเฉพาะ Accounting + financial data
   ```
3. Refresh หน้าเพจแล้วดูว่า Permission ทำงานถูกต้องหรือไม่

---

## 🚀 สรุป

เมื่อทำตามขั้นตอนข้างต้นเสร็จแล้ว:

✅ ทุก Dashboard Page จะมีระบบ Permission
✅ User สามารถเห็นเฉพาะ Component ที่มีสิทธิ์
✅ Component ที่ไม่มีสิทธิ์จะแสดง "Lock" message หรือซ่อนทั้งหมด
✅ ระบบพร้อมสำหรับการขยายและปรับแต่งต่อไป

**Happy Coding! 🎉**
