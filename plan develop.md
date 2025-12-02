# แผนการพัฒนา MIS Dashboard สำหรับระบบ ERP

## ภาพรวม

พัฒนา Dashboard ครบถ้วนสำหรับ 4 โมดูลหลัก: **บัญชี**, **ขาย**, **ซื้อ**, และ **คลังสินค้า** พร้อมระบบจัดการสิทธิ์แบบ component-level และรองรับการใช้งานบนมือถือ

### Tech Stack
- **Framework:** Next.js 15 + App Router + TypeScript
- **Database:** ClickHouse (ใช้ @clickhouse/client)
- **Styling:** Tailwind CSS v4
- **Charts:** ECharts
- **Icons:** lucide-react

---

## 1. โครงสร้างข้อมูล

### 1.1 ตารางหลักที่ใช้งาน
- `saleinvoice_transaction` + `saleinvoice_transaction_detail` - ข้อมูลขาย
- `purchase_transaction` + `purchase_transaction_detail` - ข้อมูลซื้อ
- `stock_transaction` - เคลื่อนไหวสต็อก
- `payment_transaction` - การชำระเงิน
- `journal_transaction_detail` - บันทึกบัญชี

### 1.2 Date Range Strategy
ให้ผู้ใช้เลือกช่วงเวลา:
- **Today** - วันนี้
- **This Week** - สัปดาห์นี้
- **This Month** - เดือนนี้ (Default)
- **This Quarter** - ไตรมาสนี้
- **This Year** - ปีนี้
- **Last 30 Days** - 30 วันที่ผ่านมา
- **Custom Range** - กำหนดเอง

พร้อมเปรียบเทียบกับงวดก่อน (MoM, YoY)

---

## 2. หน้าบัญชี (Accounting Dashboard)

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header + Date Range Filter                     │
├─────────────────────────────────────────────────┤
│ KPI Cards (1 row, 5 cards):                    │
│ [สินทรัพย์] [หนี้สิน] [ทุน] [รายได้] [ค่าใช้จ่าย] │
├─────────────────────────────────────────────────┤
│ กำไร(ขาดทุน) Chart (Bar + Line combo)         │
├─────────────────────────────────────────────────┤
│ [งบดุล Chart] [กระแสเงินสด Chart]              │
├─────────────────────────────────────────────────┤
│ [อายุลูกหนี้ Table] [อายุเจ้าหนี้ Table]        │
├─────────────────────────────────────────────────┤
│ [รายได้ตามหมวด Chart] [ค่าใช้จ่ายตามหมวด Chart] │
└─────────────────────────────────────────────────┘
```

### Metrics & Queries

**KPI Cards:**
1. **สินทรัพย์รวม** (Total Assets - บัญชี 1xxxxx)
   ```sql
   SELECT sum(debit - credit) as total_assets
   FROM journal_transaction_detail
   WHERE account_code LIKE '1%'
     AND doc_datetime <= {end_date}
   ```

2. **หนี้สินรวม** (Total Liabilities - บัญชี 2xxxxx)
   ```sql
   SELECT sum(credit - debit) as total_liabilities
   FROM journal_transaction_detail
   WHERE account_code LIKE '2%'
     AND doc_datetime <= {end_date}
   ```

3. **ส่วนของผู้ถือหุ้น** (Equity - บัญชี 3xxxxx)
   ```sql
   SELECT sum(credit - debit) as total_equity
   FROM journal_transaction_detail
   WHERE account_code LIKE '3%'
     AND doc_datetime <= {end_date}
   ```

4. **รายได้รวม** (Revenue - บัญชี 4xxxxx)
   ```sql
   SELECT sum(credit - debit) as total_revenue
   FROM journal_transaction_detail
   WHERE account_code LIKE '4%'
     AND doc_datetime BETWEEN {start_date} AND {end_date}
   ```

5. **ค่าใช้จ่ายรวม** (Expenses - บัญชี 5xxxxx)
   ```sql
   SELECT sum(debit - credit) as total_expenses
   FROM journal_transaction_detail
   WHERE account_code LIKE '5%'
     AND doc_datetime BETWEEN {start_date} AND {end_date}
   ```

**P&L Chart (กำไรขาดทุน):**
```sql
SELECT
  toStartOfMonth(doc_datetime) as month,
  sum(if(account_code LIKE '4%', credit - debit, 0)) as revenue,
  sum(if(account_code LIKE '5%', debit - credit, 0)) as expenses,
  sum(if(account_code LIKE '4%', credit - debit, 0)) -
  sum(if(account_code LIKE '5%', debit - credit, 0)) as net_profit
FROM journal_transaction_detail
WHERE doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY month
ORDER BY month
```
**Chart Type:** Bar + Line combo (Revenue=green bars, Expenses=red bars, Net Profit=blue line)

**Balance Sheet (งบดุล):**
```sql
SELECT
  substring(account_code, 1, 1) as account_type,
  CASE
    WHEN account_code LIKE '1%' THEN 'สินทรัพย์'
    WHEN account_code LIKE '2%' THEN 'หนี้สิน'
    WHEN account_code LIKE '3%' THEN 'ส่วนของผู้ถือหุ้น'
  END as type_name,
  account_code,
  account_name,
  if(account_code LIKE '1%', sum(debit - credit), sum(credit - debit)) as balance
FROM journal_transaction_detail
WHERE (account_code LIKE '1%' OR account_code LIKE '2%' OR account_code LIKE '3%')
  AND doc_datetime <= {end_date}
GROUP BY account_type, type_name, account_code, account_name
HAVING balance != 0
ORDER BY account_code
```
**Chart Type:** Nested bar chart แยกตามหมวดบัญชี

**Cash Flow (กระแสเงินสด):**
```sql
-- Operating Activities
SELECT
  'Operating' as activity_type,
  sum(if(account_code LIKE '4%', credit - debit, 0)) -
  sum(if(account_code LIKE '5%', debit - credit, 0)) as net_cash_flow
FROM journal_transaction_detail
WHERE doc_datetime BETWEEN {start_date} AND {end_date}

UNION ALL

-- Investing Activities
SELECT
  'Investing',
  -sum(debit - credit)
FROM journal_transaction_detail
WHERE account_code LIKE '12%'
  AND doc_datetime BETWEEN {start_date} AND {end_date}

UNION ALL

-- Financing Activities
SELECT
  'Financing',
  sum(credit - debit)
FROM journal_transaction_detail
WHERE (account_code LIKE '21%' OR account_code LIKE '3%')
  AND doc_datetime BETWEEN {start_date} AND {end_date}
```
**Chart Type:** Waterfall chart

**AR Aging (อายุลูกหนี้):**
```sql
SELECT
  customer_code,
  customer_name,
  doc_no,
  doc_datetime,
  due_date,
  total_amount,
  sum_pay_money,
  total_amount - sum_pay_money as outstanding,
  dateDiff('day', due_date, now()) as days_overdue,
  CASE
    WHEN dateDiff('day', due_date, now()) <= 0 THEN 'ยังไม่ครบกำหนด'
    WHEN dateDiff('day', due_date, now()) <= 30 THEN '1-30 วัน'
    WHEN dateDiff('day', due_date, now()) <= 60 THEN '31-60 วัน'
    WHEN dateDiff('day', due_date, now()) <= 90 THEN '61-90 วัน'
    ELSE 'เกิน 90 วัน'
  END as aging_bucket
FROM saleinvoice_transaction
WHERE status_payment IN ('Outstanding', 'Partially Paid')
  AND status_cancel != 'Cancel'
  AND doc_type = 'CREDIT'
ORDER BY days_overdue DESC
```
**UI Type:** Sortable table with aging buckets

**AP Aging (อายุเจ้าหนี้):**
```sql
SELECT
  supplier_code,
  supplier_name,
  doc_no,
  due_date,
  total_amount - sum_pay_money as outstanding,
  dateDiff('day', due_date, now()) as days_overdue,
  CASE
    WHEN dateDiff('day', due_date, now()) <= 0 THEN 'ยังไม่ครบกำหนด'
    WHEN dateDiff('day', due_date, now()) <= 30 THEN '1-30 วัน'
    WHEN dateDiff('day', due_date, now()) <= 60 THEN '31-60 วัน'
    WHEN dateDiff('day', due_date, now()) <= 90 THEN '61-90 วัน'
    ELSE 'เกิน 90 วัน'
  END as aging_bucket
FROM purchase_transaction
WHERE status_payment IN ('Outstanding', 'Partially Paid')
  AND status_cancel != 'Cancel'
  AND doc_type = 'CREDIT'
ORDER BY days_overdue DESC
```

**Revenue/Expense Breakdown (รายได้-ค่าใช้จ่ายตามหมวด):**
```sql
-- รายได้
SELECT
  substring(account_code, 1, 2) as account_group,
  account_name,
  sum(credit - debit) as amount,
  (sum(credit - debit) /
   (SELECT sum(credit - debit) FROM journal_transaction_detail
    WHERE account_code LIKE '4%' AND doc_datetime BETWEEN {start_date} AND {end_date})
  ) * 100 as percentage
FROM journal_transaction_detail
WHERE account_code LIKE '4%'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY account_group, account_name
ORDER BY amount DESC
```
**Chart Type:** Pie/Donut chart

### Components ที่ต้องสร้าง
- `/src/components/accounting/BalanceSheetChart.tsx`
- `/src/components/accounting/CashFlowChart.tsx`
- `/src/components/accounting/ARAgingTable.tsx`
- `/src/components/accounting/APAgingTable.tsx`
- `/src/components/accounting/RevenueBreakdownChart.tsx`
- `/src/components/accounting/ExpenseBreakdownChart.tsx`

### API Routes
- `/src/app/api/accounting/kpis/route.ts`
- `/src/app/api/accounting/profit-loss/route.ts`
- `/src/app/api/accounting/balance-sheet/route.ts`
- `/src/app/api/accounting/cash-flow/route.ts`
- `/src/app/api/accounting/ar-aging/route.ts`
- `/src/app/api/accounting/ap-aging/route.ts`
- `/src/app/api/accounting/revenue-expense-breakdown/route.ts`

---

## 3. หน้าขาย (Sales Dashboard)

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header + Filters (Date, Branch, Sales Person)  │
├─────────────────────────────────────────────────┤
│ KPI Cards (1 row, 4 cards):                    │
│ [ยอดขาย] [กำไรขั้นต้น] [จำนวนออเดอร์] [ค่าเฉลี่ย] │
├─────────────────────────────────────────────────┤
│ Sales Trend Chart (Area chart พร้อมเปรียบเทียบ) │
├─────────────────────────────────────────────────┤
│ [Top Products Table] [Sales by Branch Chart]   │
├─────────────────────────────────────────────────┤
│ [Sales by Person Table] [Top Customers Table]  │
├─────────────────────────────────────────────────┤
│ AR Status Summary (Donut + Cards)              │
└─────────────────────────────────────────────────┘
```

### Metrics & Queries

**KPI Cards:**
```sql
-- ยอดขายรวม + เปรียบเทียบ
SELECT
  sum(total_amount) as total_sales,
  sumIf(total_amount, toYYYYMM(doc_datetime) = toYYYYMM(now())) as this_month,
  sumIf(total_amount, toYYYYMM(doc_datetime) = toYYYYMM(now() - INTERVAL 1 MONTH)) as last_month,
  ((this_month - last_month) / last_month) * 100 as mom_growth
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
```

```sql
-- กำไรขั้นต้น
SELECT
  sum(sid.sum_amount - sid.sum_of_cost) as gross_profit,
  sum(sid.sum_amount) as revenue,
  (gross_profit / revenue) * 100 as gross_margin_pct
FROM saleinvoice_transaction_detail sid
JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no
WHERE si.status_cancel != 'Cancel'
  AND si.doc_datetime BETWEEN {start_date} AND {end_date}
```

```sql
-- จำนวนออเดอร์
SELECT
  count(DISTINCT doc_no) as total_orders,
  avg(total_amount) as avg_order_value,
  uniq(customer_code) as unique_customers
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
```

**Sales Trend:**
```sql
SELECT
  toStartOfDay(doc_datetime) as date,
  sum(total_amount) as sales,
  count(DISTINCT doc_no) as order_count
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY date
ORDER BY date
```
**Chart Type:** Area chart with gradient

**Top Products:**
```sql
SELECT
  sid.item_code,
  sid.item_name,
  sid.item_brand_name,
  sid.item_category_name,
  sum(sid.qty) as total_qty_sold,
  sum(sid.sum_amount) as total_sales,
  sum(sid.sum_amount - sid.sum_of_cost) as total_profit,
  (total_profit / total_sales) * 100 as profit_margin_pct
FROM saleinvoice_transaction_detail sid
JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no
WHERE si.status_cancel != 'Cancel'
  AND si.doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY sid.item_code, sid.item_name, sid.item_brand_name, sid.item_category_name
ORDER BY total_sales DESC
LIMIT 10
```
**UI Type:** Table with sorting

**Sales by Branch:**
```sql
SELECT
  branch_code,
  branch_name,
  count(DISTINCT doc_no) as order_count,
  sum(total_amount) as total_sales
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY branch_code, branch_name
ORDER BY total_sales DESC
```
**Chart Type:** Pie/Donut chart

**Sales by Person:**
```sql
SELECT
  sale_code,
  sale_name,
  count(DISTINCT doc_no) as order_count,
  sum(total_amount) as total_sales,
  avg(total_amount) as avg_order_value,
  uniq(customer_code) as customer_count
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY sale_code, sale_name
ORDER BY total_sales DESC
```
**UI Type:** Table

**Top Customers:**
```sql
SELECT
  customer_code,
  customer_name,
  count(DISTINCT doc_no) as order_count,
  sum(total_amount) as total_spent,
  avg(total_amount) as avg_order_value,
  max(doc_datetime) as last_order_date,
  dateDiff('day', last_order_date, now()) as days_since_last_order
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND customer_code != ''
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY customer_code, customer_name
ORDER BY total_spent DESC
LIMIT 20
```

**AR Status:**
```sql
SELECT
  status_payment,
  count(DISTINCT doc_no) as invoice_count,
  sum(total_amount) as total_invoice_amount,
  sum(sum_pay_money) as total_paid,
  sum(total_amount - sum_pay_money) as total_outstanding
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
  AND doc_type = 'CREDIT'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY status_payment
```
**Chart Type:** Donut chart

### Components ที่ต้องสร้าง
- `/src/components/sales/SalesTrendChart.tsx`
- `/src/components/sales/TopProductsTable.tsx`
- `/src/components/sales/SalesByBranchChart.tsx`
- `/src/components/sales/SalesByPersonTable.tsx`
- `/src/components/sales/TopCustomersTable.tsx`
- `/src/components/sales/ARStatusChart.tsx`

### API Routes
- `/src/app/api/sales/kpis/route.ts`
- `/src/app/api/sales/trend/route.ts`
- `/src/app/api/sales/top-products/route.ts`
- `/src/app/api/sales/by-branch/route.ts`
- `/src/app/api/sales/by-salesperson/route.ts`
- `/src/app/api/sales/top-customers/route.ts`
- `/src/app/api/sales/ar-status/route.ts`

---

## 4. หน้าซื้อ (Purchase Dashboard)

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header + Filters (Date, Supplier, Category)    │
├─────────────────────────────────────────────────┤
│ KPI Cards (1 row, 4 cards):                    │
│ [ยอดซื้อ] [จำนวน PO] [ค่าเฉลี่ย PO] [เจ้าหนี้ค้าง] │
├─────────────────────────────────────────────────┤
│ Purchase Trend Chart                            │
├─────────────────────────────────────────────────┤
│ [Top Suppliers Table] [Purchase by Category]   │
├─────────────────────────────────────────────────┤
│ [AP Outstanding Table] [Purchase by Brand]     │
├─────────────────────────────────────────────────┤
│ Average Purchase Price Trend                    │
└─────────────────────────────────────────────────┘
```

### Metrics & Queries

**KPI Cards:**
```sql
SELECT
  sum(total_amount) as total_purchases,
  count(DISTINCT doc_no) as total_po_count,
  avg(total_amount) as avg_po_value,
  sumIf(total_amount - sum_pay_money, status_payment IN ('Outstanding', 'Partially Paid')) as ap_outstanding
FROM purchase_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
```

**Purchase Trend:**
```sql
SELECT
  toStartOfMonth(doc_datetime) as month,
  sum(total_amount) as total_purchases,
  count(DISTINCT doc_no) as po_count
FROM purchase_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY month
ORDER BY month
```
**Chart Type:** Line chart

**Top Suppliers:**
```sql
SELECT
  supplier_code,
  supplier_name,
  count(DISTINCT doc_no) as po_count,
  sum(total_amount) as total_purchases,
  avg(total_amount) as avg_po_value,
  max(doc_datetime) as last_purchase_date
FROM purchase_transaction
WHERE status_cancel != 'Cancel'
  AND doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY supplier_code, supplier_name
ORDER BY total_purchases DESC
LIMIT 10
```

**Purchase by Category:**
```sql
SELECT
  ptd.item_category_code,
  ptd.item_category_name,
  sum(ptd.qty) as total_qty,
  sum(ptd.sum_amount) as total_purchase_value
FROM purchase_transaction_detail ptd
JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no
WHERE pt.status_cancel != 'Cancel'
  AND pt.doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY ptd.item_category_code, ptd.item_category_name
ORDER BY total_purchase_value DESC
```
**Chart Type:** Horizontal bar chart

**Purchase by Brand:**
```sql
SELECT
  ptd.item_brand_code,
  ptd.item_brand_name,
  sum(ptd.sum_amount) as total_purchase_value
FROM purchase_transaction_detail ptd
JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no
WHERE pt.status_cancel != 'Cancel'
  AND pt.doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY ptd.item_brand_code, ptd.item_brand_name
ORDER BY total_purchase_value DESC
```
**Chart Type:** Pie chart

**AP Outstanding:**
```sql
SELECT
  supplier_code,
  supplier_name,
  doc_no,
  due_date,
  total_amount - sum_pay_money as outstanding,
  dateDiff('day', due_date, now()) as days_overdue,
  status_payment
FROM purchase_transaction
WHERE status_cancel != 'Cancel'
  AND doc_type = 'CREDIT'
  AND status_payment IN ('Outstanding', 'Partially Paid')
ORDER BY days_overdue DESC
```

**Average Purchase Price:**
```sql
SELECT
  ptd.item_code,
  ptd.item_name,
  avg(ptd.price) as avg_price,
  min(ptd.price) as min_price,
  max(ptd.price) as max_price,
  count(DISTINCT pt.supplier_code) as supplier_count
FROM purchase_transaction_detail ptd
JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no
WHERE pt.status_cancel != 'Cancel'
  AND pt.doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY ptd.item_code, ptd.item_name
ORDER BY avg_price DESC
LIMIT 50
```

### Components ที่ต้องสร้าง
- `/src/components/purchase/PurchaseTrendChart.tsx`
- `/src/components/purchase/TopSuppliersTable.tsx`
- `/src/components/purchase/PurchaseByCategoryChart.tsx`
- `/src/components/purchase/PurchaseByBrandChart.tsx`
- `/src/components/purchase/APOutstandingTable.tsx`
- `/src/components/purchase/AveragePriceChart.tsx`

### API Routes
- `/src/app/api/purchase/kpis/route.ts`
- `/src/app/api/purchase/trend/route.ts`
- `/src/app/api/purchase/top-suppliers/route.ts`
- `/src/app/api/purchase/by-category/route.ts`
- `/src/app/api/purchase/by-brand/route.ts`
- `/src/app/api/purchase/ap-outstanding/route.ts`
- `/src/app/api/purchase/average-price/route.ts`

---

## 5. หน้าคลังสินค้า (Inventory Dashboard)

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header + Filters (Warehouse, Category, Brand)  │
├─────────────────────────────────────────────────┤
│ KPI Cards (1 row, 4 cards):                    │
│ [มูลค่ารวม] [จำนวนรายการ] [สินค้าใกล้หมด] [คงคลังมาก] │
├─────────────────────────────────────────────────┤
│ Stock Movement Chart (Stacked Bar - In/Out)    │
├─────────────────────────────────────────────────┤
│ [Stock by Warehouse] [Inventory Turnover]      │
├─────────────────────────────────────────────────┤
│ [Low Stock Alert Table] [Slow-Moving Table]    │
├─────────────────────────────────────────────────┤
│ [Overstock Items Table]                         │
└─────────────────────────────────────────────────┘
```

### Metrics & Queries

**KPI Cards:**
```sql
SELECT
  sum(amount) as total_inventory_value,
  count(DISTINCT item_code) as total_items,
  countIf(qty > 0 AND qty < 10) as low_stock_items,
  countIf(qty > 1000) as overstock_items
FROM (
  SELECT
    item_code,
    sum(qty) as qty,
    sum(amount) as amount
  FROM stock_transaction
  GROUP BY item_code
  HAVING qty > 0
)
```

**Stock Movement:**
```sql
SELECT
  toStartOfDay(doc_datetime) as date,
  sum(if(qty > 0, qty, 0)) as qty_in,
  sum(if(qty < 0, -qty, 0)) as qty_out,
  sum(if(qty > 0, amount, 0)) as value_in,
  sum(if(qty < 0, -amount, 0)) as value_out
FROM stock_transaction
WHERE doc_datetime BETWEEN {start_date} AND {end_date}
GROUP BY date
ORDER BY date
```
**Chart Type:** Stacked bar chart

**Stock by Warehouse:**
```sql
SELECT
  wh_code,
  wh_name,
  count(DISTINCT item_code) as unique_items,
  sum(qty) as total_qty,
  sum(amount) as total_value
FROM stock_transaction
GROUP BY wh_code, wh_name
HAVING total_qty > 0
ORDER BY total_value DESC
```
**Chart Type:** Pie/Donut chart

**Low Stock Items:**
```sql
SELECT
  st.item_code,
  st.item_name,
  st.item_brand_name,
  st.item_category_name,
  st.wh_name,
  sum(st.qty) as current_stock,
  sum(st.amount) as stock_value
FROM stock_transaction st
GROUP BY st.item_code, st.item_name, st.item_brand_name, st.item_category_name, st.wh_name
HAVING current_stock < 10 AND current_stock > 0
ORDER BY current_stock ASC
LIMIT 50
```

**Overstock Items:**
```sql
SELECT
  st.item_code,
  st.item_name,
  st.item_category_name,
  sum(st.qty) as current_stock,
  sum(st.amount) as stock_value
FROM stock_transaction st
GROUP BY st.item_code, st.item_name, st.item_category_name
HAVING current_stock > 1000
ORDER BY current_stock DESC
LIMIT 50
```

**Slow-Moving Items:**
```sql
SELECT
  st.item_code,
  st.item_name,
  sum(st.qty) as current_stock,
  sum(st.amount) as stock_value,
  (SELECT max(si.doc_datetime)
   FROM saleinvoice_transaction_detail sid
   JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no
   WHERE sid.item_code = st.item_code
     AND si.status_cancel != 'Cancel') as last_sale_date,
  dateDiff('day', last_sale_date, now()) as days_since_last_sale
FROM stock_transaction st
GROUP BY st.item_code, st.item_name
HAVING current_stock > 0
  AND (days_since_last_sale > 90 OR last_sale_date IS NULL)
ORDER BY stock_value DESC
LIMIT 50
```

**Inventory Turnover:**
```sql
SELECT
  sid.item_code,
  sid.item_name,
  sid.item_category_name,
  sum(sid.sum_of_cost) as total_cogs,
  -- สต็อกเฉลี่ยประมาณ (ต้องคำนวณจากหลายเดือน)
  (SELECT avg(stock_value)
   FROM (
     SELECT sum(amount) as stock_value
     FROM stock_transaction
     WHERE item_code = sid.item_code
     GROUP BY toStartOfMonth(doc_datetime)
   )) as avg_inventory_value,
  total_cogs / avg_inventory_value as turnover_ratio,
  365 / turnover_ratio as days_inventory_outstanding
FROM saleinvoice_transaction_detail sid
JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no
WHERE si.status_cancel != 'Cancel'
  AND si.doc_datetime >= now() - INTERVAL 365 DAY
GROUP BY sid.item_code, sid.item_name, sid.item_category_name
HAVING avg_inventory_value > 0
ORDER BY turnover_ratio DESC
LIMIT 100
```

### Components ที่ต้องสร้าง
- `/src/components/inventory/StockMovementChart.tsx`
- `/src/components/inventory/StockByWarehouseChart.tsx`
- `/src/components/inventory/InventoryTurnoverChart.tsx`
- `/src/components/inventory/LowStockTable.tsx`
- `/src/components/inventory/SlowMovingTable.tsx`
- `/src/components/inventory/OverstockTable.tsx`

### API Routes
- `/src/app/api/inventory/kpis/route.ts`
- `/src/app/api/inventory/movement/route.ts`
- `/src/app/api/inventory/by-warehouse/route.ts`
- `/src/app/api/inventory/low-stock/route.ts`
- `/src/app/api/inventory/overstock/route.ts`
- `/src/app/api/inventory/slow-moving/route.ts`
- `/src/app/api/inventory/turnover/route.ts`

---

## 6. ระบบจัดการสิทธิ์ (Permission System)

### 6.1 Permission Model (Component-Level)

**Permission Structure:**
```typescript
interface Permission {
  componentId: string;  // "accounting.kpi.assets"
  action: 'view' | 'export';
  granted: boolean;
}
```

**Component ID Naming:**
- `accounting.kpi.assets`
- `accounting.kpi.liabilities`
- `accounting.chart.profit_loss`
- `accounting.chart.balance_sheet`
- `sales.kpi.total_sales`
- `sales.chart.trend`
- `sales.table.top_products`
- ... (และอื่นๆ)

### 6.2 Database Schema

สร้างตารางใหม่:
```sql
-- Roles
CREATE TABLE roles (
  role_id VARCHAR PRIMARY KEY,
  role_name VARCHAR,
  description VARCHAR
);

-- Permissions
CREATE TABLE permissions (
  permission_id VARCHAR PRIMARY KEY,
  component_id VARCHAR,
  action VARCHAR,
  description VARCHAR
);

-- Role-Permission Mapping
CREATE TABLE role_permissions (
  role_id VARCHAR,
  permission_id VARCHAR,
  granted Boolean DEFAULT true
);

-- User-Role Mapping
CREATE TABLE user_roles (
  user_id VARCHAR,
  role_id VARCHAR,
  created_at DateTime DEFAULT now()
);
```

### 6.3 Implementation

**Permission Context:**
```typescript
// src/contexts/PermissionContext.tsx
'use client';

interface PermissionContextType {
  hasPermission: (componentId: string, action?: string) => boolean;
  userRoles: string[];
}

export function PermissionProvider({ children, permissions }) {
  const hasPermission = (componentId: string, action: string = 'view') => {
    const key = `${componentId}.${action}`;
    return permissions[key] ?? false;
  };

  return <PermissionContext.Provider value={{ hasPermission }}>
    {children}
  </PermissionContext.Provider>;
}
```

**Protected Component Wrapper:**
```typescript
// src/components/ProtectedComponent.tsx
export function ProtectedComponent({
  componentId,
  action = 'view',
  children,
  fallback = null
}) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(componentId, action)) {
    return fallback;
  }

  return <>{children}</>;
}
```

**Usage:**
```tsx
<ProtectedComponent componentId="accounting.kpi.assets">
  <KPICard title="Assets" value={assets} />
</ProtectedComponent>
```

### 6.4 Admin UI

สร้างหน้า `/admin/roles` สำหรับจัดการสิทธิ์:
- แสดง Role list
- แก้ไข permissions แต่ละ role
- Permission tree view (Accounting → KPI → Assets)
- Assign roles ให้ users

---

## 7. UI/UX Design

### 7.1 Design Principles
- **มินิมอล สะอาดตา:** ใช้ white space มากขึ้น, ลดความซับซ้อน
- **Responsive:** ทำงานได้ดีทั้ง desktop และ mobile
- **Consistent:** ใช้ components เดียวกันทั้งระบบ
- **Accessible:** รองรับ keyboard navigation

### 7.2 Color Scheme
ใช้ Tailwind CSS variables ที่มีอยู่:
- **Primary:** สีหลัก (blue/indigo)
- **Success:** สีเขียว (สำหรับกำไร, เพิ่มขึ้น)
- **Destructive:** สีแดง (สำหรับขาดทุน, ลดลง)
- **Muted:** สีเทา (สำหรับ secondary info)
- **Chart colors:** ใช้ chart-1 ถึง chart-5

### 7.3 Typography
- **Font:** Inter (Google Fonts)
- **Heading:** font-semibold text-lg/xl/2xl
- **Body:** font-normal text-sm/base
- **Numbers:** font-medium (ให้โดดเด่น)

### 7.4 Mobile Responsive

**Breakpoints:**
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

**Grid System:**
```tsx
// KPI Cards: 1 col mobile, 2 col tablet, 4 col desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Charts: 1 col mobile, 2 col desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

**Mobile Adjustments:**
- ซ่อนบาง columns ในตารางบน mobile
- Charts มี min-height ที่เหมาะสม
- Touch-friendly button sizes (min 44x44px)

### 7.5 Chart Guidelines

| Data Type | Chart Type | ECharts Config |
|-----------|-----------|----------------|
| Trend over time | Line/Area | `type: 'line'` with `areaStyle` |
| Comparison | Bar | `type: 'bar'` |
| Distribution | Pie/Donut | `type: 'pie'` with `radius: ['40%', '70%']` |
| Multi-series | Stacked Bar | `type: 'bar'` with `stack: 'total'` |
| Waterfall | Custom Bar | Bar series with custom positioning |

**Common Settings:**
```typescript
const chartOption = {
  grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0 },
  // ... series
};
```

---

## 8. Data Layer Architecture

### 8.1 โครงสร้างไฟล์

```
src/lib/data/
├── index.ts           # Export all functions
├── types.ts           # TypeScript interfaces
├── common.ts          # Common utilities
├── accounting.ts      # Accounting queries
├── sales.ts           # Sales queries
├── purchase.ts        # Purchase queries
└── inventory.ts       # Inventory queries

src/lib/
├── clickhouse.ts      # ClickHouse client (มีอยู่แล้ว)
├── cache.ts           # Caching utilities (ใหม่)
├── errors.ts          # Error handling (ใหม่)
├── dateRanges.ts      # Date range presets (ใหม่)
└── comparison.ts      # Period comparison utilities (ใหม่)
```

### 8.2 TypeScript Types

```typescript
// src/lib/data/types.ts
export interface DateRange {
  start: string;  // ISO date string
  end: string;
}

export interface KPIData {
  value: number;
  previousValue?: number;
  growth?: number;
  growthPercentage?: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

// ... และอื่นๆ
```

### 8.3 Caching Strategy

**Server-Side Cache:**
```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache';

export function createCachedQuery<T>(
  queryFn: () => Promise<T>,
  keyParts: string[],
  revalidate: number = 300  // 5 minutes default
) {
  return unstable_cache(queryFn, keyParts, {
    revalidate,
    tags: keyParts,
  });
}
```

**Usage:**
```typescript
// API route
const cachedData = await createCachedQuery(
  () => getAccountingKPIs(dateRange),
  ['accounting', 'kpis', startDate, endDate],
  300  // cache 5 minutes
)();
```

### 8.4 Error Handling

```typescript
// src/lib/errors.ts
export class APIError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Usage in API route
try {
  const data = await fetchData();
  return NextResponse.json(data);
} catch (error) {
  if (error instanceof APIError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

## 9. Shared Components

### 9.1 Components ที่ใช้ร่วมกัน

**Date Range Filter:**
```typescript
// src/components/DateRangeFilter.tsx
export function DateRangeFilter({
  value,
  onChange
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  // Dropdown: Today, This Week, This Month, etc.
  // Custom date picker
}
```

**Filter Dropdown:**
```typescript
// src/components/FilterDropdown.tsx
export function FilterDropdown({
  label,
  options,
  value,
  onChange
}) {
  // Generic dropdown for filtering
}
```

**Loading States:**
```typescript
// src/components/LoadingSkeleton.tsx
export function KPICardSkeleton() { }
export function ChartSkeleton() { }
export function TableSkeleton() { }
```

**Error Boundary:**
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  // Catch and display errors gracefully
}
```

### 9.2 Components ที่มีอยู่แล้ว (ใช้ต่อ)
- `KPICard.tsx` - แสดง KPI metrics
- `DataCard.tsx` - Card container
- `Header.tsx` - Page header
- `Sidebar.tsx` - Navigation

---

## 10. Implementation Steps (แบ่งตาม Phase)

---

### 📦 Phase 1: Foundation & Setup (วันที่ 1-3)

**เป้าหมาย:** สร้างโครงสร้างพื้นฐานและ utilities ที่จะใช้ร่วมกันทั้งหมด

**Tasks:**

#### 1.1 Setup Data Layer Foundation
- [ ] สร้าง `/src/lib/data/types.ts`
  - Define interfaces: `DateRange`, `KPIData`, `ChartDataPoint`, etc.
  - Export all TypeScript types

- [ ] สร้าง `/src/lib/cache.ts`
  - Function `createCachedQuery()` สำหรับ server-side caching
  - ใช้ Next.js `unstable_cache`

- [ ] สร้าง `/src/lib/errors.ts`
  - Class `APIError` สำหรับ error handling
  - Helper functions สำหรับ error responses

#### 1.2 Date & Comparison Utilities
- [ ] สร้าง `/src/lib/dateRanges.ts`
  - Define preset date ranges (Today, This Week, This Month, etc.)
  - Helper functions สำหรับ date calculations

- [ ] สร้าง `/src/lib/comparison.ts`
  - Function `getPreviousPeriod()` สำหรับหาช่วงเวลาก่อนหน้า
  - Function `calculateGrowth()` สำหรับคำนวณ % growth

#### 1.3 Shared Components
- [ ] สร้าง `/src/components/DateRangeFilter.tsx`
  - Dropdown สำหรับเลือก date range
  - Support predefined ranges + custom date picker

- [ ] สร้าง `/src/components/FilterDropdown.tsx`
  - Generic dropdown component สำหรับ filter ต่างๆ

- [ ] สร้าง `/src/components/LoadingSkeleton.tsx`
  - `KPICardSkeleton()`
  - `ChartSkeleton()`
  - `TableSkeleton()`

- [ ] สร้าง `/src/components/ErrorBoundary.tsx`
  - Error boundary component สำหรับ catch errors

#### 1.4 ติดตั้ง Dependencies
- [ ] Run: `npm install date-fns zod`

**Deliverable:**
- ✅ โครงสร้างพื้นฐานพร้อมใช้งาน
- ✅ Shared components และ utilities ครบ
- ✅ TypeScript types defined

---

### 💰 Phase 2: Accounting Module (วันที่ 4-10)

**เป้าหมาย:** สร้างหน้า Accounting Dashboard ให้สมบูรณ์

**Tasks:**

#### 2.1 Data Layer - Accounting
- [ ] สร้าง `/src/lib/data/accounting.ts`
  - `getAccountingKPIs()` - Assets, Liabilities, Equity, Revenue, Expenses
  - `getProfitLossData()` - P&L by month
  - `getBalanceSheetData()` - งบดุล
  - `getCashFlowData()` - กระแสเงินสด (Operating, Investing, Financing)
  - `getARAgingData()` - อายุลูกหนี้
  - `getAPAgingData()` - อายุเจ้าหนี้
  - `getRevenueExpenseBreakdown()` - รายได้-ค่าใช้จ่ายตามหมวด

#### 2.2 API Routes - Accounting
- [ ] `/src/app/api/accounting/kpis/route.ts`
- [ ] `/src/app/api/accounting/profit-loss/route.ts`
- [ ] `/src/app/api/accounting/balance-sheet/route.ts`
- [ ] `/src/app/api/accounting/cash-flow/route.ts`
- [ ] `/src/app/api/accounting/ar-aging/route.ts`
- [ ] `/src/app/api/accounting/ap-aging/route.ts`
- [ ] `/src/app/api/accounting/revenue-expense-breakdown/route.ts`

#### 2.3 UI Components - Accounting
- [ ] `/src/components/accounting/BalanceSheetChart.tsx`
  - Nested bar chart แยกตาม account type

- [ ] `/src/components/accounting/CashFlowChart.tsx`
  - Waterfall chart สำหรับ cash flow

- [ ] `/src/components/accounting/ARAgingTable.tsx`
  - Sortable table พร้อม aging buckets

- [ ] `/src/components/accounting/APAgingTable.tsx`
  - Sortable table พร้อม aging buckets

- [ ] `/src/components/accounting/RevenueBreakdownChart.tsx`
  - Pie/Donut chart สำหรับรายได้

- [ ] `/src/components/accounting/ExpenseBreakdownChart.tsx`
  - Pie/Donut chart สำหรับค่าใช้จ่าย

#### 2.4 Dashboard Page
- [ ] Update `/src/app/accounting/page.tsx`
  - Layout ตามที่ออกแบบ (5 KPI cards + charts + tables)
  - Integrate all components
  - Add DateRangeFilter
  - Add loading states & error boundaries

**Deliverable:**
- ✅ Accounting Dashboard ใช้งานได้เต็มรูปแบบ
- ✅ ทุก metric แสดงผลถูกต้อง
- ✅ Charts และ tables responsive

---

### 🛒 Phase 3: Sales Module (วันที่ 11-17)

**เป้าหมาย:** สร้างหน้า Sales Dashboard ให้สมบูรณ์

**Tasks:**

#### 3.1 Data Layer - Sales
- [ ] สร้าง `/src/lib/data/sales.ts`
  - `getSalesKPIs()` - Total sales, gross profit, orders, avg order value
  - `getSalesTrendData()` - Sales trend by day/month
  - `getTopProducts()` - Top 10 selling products
  - `getSalesByBranch()` - ยอดขายตามสาขา
  - `getSalesBySalesperson()` - ยอดขายตามพนักงาน
  - `getTopCustomers()` - Top customers
  - `getARStatus()` - สถานะลูกหนี้

#### 3.2 API Routes - Sales
- [ ] `/src/app/api/sales/kpis/route.ts`
- [ ] `/src/app/api/sales/trend/route.ts`
- [ ] `/src/app/api/sales/top-products/route.ts`
- [ ] `/src/app/api/sales/by-branch/route.ts`
- [ ] `/src/app/api/sales/by-salesperson/route.ts`
- [ ] `/src/app/api/sales/top-customers/route.ts`
- [ ] `/src/app/api/sales/ar-status/route.ts`

#### 3.3 UI Components - Sales
- [ ] `/src/components/sales/SalesTrendChart.tsx`
  - Area chart พร้อมเปรียบเทียบงวดก่อน

- [ ] `/src/components/sales/TopProductsTable.tsx`
  - Table พร้อม sorting columns

- [ ] `/src/components/sales/SalesByBranchChart.tsx`
  - Pie/Donut chart

- [ ] `/src/components/sales/SalesByPersonTable.tsx`
  - Table แสดงยอดขายแต่ละคน

- [ ] `/src/components/sales/TopCustomersTable.tsx`
  - Table แสดง top customers

- [ ] `/src/components/sales/ARStatusChart.tsx`
  - Donut chart สำหรับ AR status

#### 3.4 Dashboard Page
- [ ] Update `/src/app/sales/page.tsx`
  - Layout ครบตามแผน
  - Filters: Date, Branch, Sales Person
  - Integrate all components

**Deliverable:**
- ✅ Sales Dashboard ใช้งานได้เต็มรูปแบบ
- ✅ มี filters และ date range selector
- ✅ ทุก metric แสดงผลถูกต้อง

---

### 📦 Phase 4: Purchase Module (วันที่ 18-24)

**เป้าหมาย:** สร้างหน้า Purchase Dashboard (หน้าใหม่)

**Tasks:**

#### 4.1 Data Layer - Purchase
- [ ] สร้าง `/src/lib/data/purchase.ts`
  - `getPurchaseKPIs()` - Total purchases, PO count, avg PO value, AP outstanding
  - `getPurchaseTrendData()` - Purchase trend by month
  - `getTopSuppliers()` - Top 10 suppliers
  - `getPurchaseByCategory()` - ยอดซื้อตาม category
  - `getPurchaseByBrand()` - ยอดซื้อตาม brand
  - `getAPOutstanding()` - เจ้าหนี้ค้างชำระ
  - `getAveragePurchasePrice()` - ราคาซื้อเฉลี่ย

#### 4.2 API Routes - Purchase
- [ ] `/src/app/api/purchase/kpis/route.ts`
- [ ] `/src/app/api/purchase/trend/route.ts`
- [ ] `/src/app/api/purchase/top-suppliers/route.ts`
- [ ] `/src/app/api/purchase/by-category/route.ts`
- [ ] `/src/app/api/purchase/by-brand/route.ts`
- [ ] `/src/app/api/purchase/ap-outstanding/route.ts`
- [ ] `/src/app/api/purchase/average-price/route.ts`

#### 4.3 UI Components - Purchase
- [ ] `/src/components/purchase/PurchaseTrendChart.tsx`
  - Line chart

- [ ] `/src/components/purchase/TopSuppliersTable.tsx`
  - Table แสดง top suppliers

- [ ] `/src/components/purchase/PurchaseByCategoryChart.tsx`
  - Horizontal bar chart

- [ ] `/src/components/purchase/PurchaseByBrandChart.tsx`
  - Pie chart

- [ ] `/src/components/purchase/APOutstandingTable.tsx`
  - Table แสดงเจ้าหนี้ค้าง

- [ ] `/src/components/purchase/AveragePriceChart.tsx`
  - Line/Bar chart แสดงราคาเฉลี่ย

#### 4.4 Dashboard Page & Navigation
- [ ] สร้าง `/src/app/purchase/page.tsx` (หน้าใหม่)
  - Layout ครบตามแผน
  - Filters: Date, Supplier, Category

- [ ] Update `/src/components/Sidebar.tsx`
  - เพิ่ม menu "ซื้อ" (Purchase)

**Deliverable:**
- ✅ Purchase Dashboard ใช้งานได้เต็มรูปแบบ
- ✅ Menu "ซื้อ" ปรากฏใน Sidebar
- ✅ ทุก metric แสดงผลถูกต้อง

---

### 📊 Phase 5: Inventory Module (วันที่ 25-31)

**เป้าหมาย:** อัพเดทหน้า Inventory Dashboard ให้สมบูรณ์

**Tasks:**

#### 5.1 Data Layer - Inventory
- [ ] สร้าง `/src/lib/data/inventory.ts`
  - `getInventoryKPIs()` - Total value, item count, low stock, overstock
  - `getStockMovement()` - Stock in/out by day
  - `getStockByWarehouse()` - สต็อกแยกตามคลัง
  - `getLowStockItems()` - สินค้าใกล้หมด
  - `getOverstockItems()` - สินค้าคงคลังมาก
  - `getSlowMovingItems()` - สินค้าขายช้า
  - `getInventoryTurnover()` - Inventory turnover ratio

#### 5.2 API Routes - Inventory
- [ ] `/src/app/api/inventory/kpis/route.ts`
- [ ] `/src/app/api/inventory/movement/route.ts`
- [ ] `/src/app/api/inventory/by-warehouse/route.ts`
- [ ] `/src/app/api/inventory/low-stock/route.ts`
- [ ] `/src/app/api/inventory/overstock/route.ts`
- [ ] `/src/app/api/inventory/slow-moving/route.ts`
- [ ] `/src/app/api/inventory/turnover/route.ts`

#### 5.3 UI Components - Inventory
- [ ] `/src/components/inventory/StockMovementChart.tsx`
  - Stacked bar chart (In/Out)

- [ ] `/src/components/inventory/StockByWarehouseChart.tsx`
  - Pie/Donut chart

- [ ] `/src/components/inventory/InventoryTurnoverChart.tsx`
  - Bubble or bar chart

- [ ] `/src/components/inventory/LowStockTable.tsx`
  - Table แสดงสินค้าใกล้หมด

- [ ] `/src/components/inventory/SlowMovingTable.tsx`
  - Table แสดง slow-moving items

- [ ] `/src/components/inventory/OverstockTable.tsx`
  - Table แสดงสินค้าคงคลังมาก

#### 5.4 Dashboard Page
- [ ] Update `/src/app/inventory/page.tsx`
  - Layout ครบตามแผน
  - Filters: Warehouse, Category, Brand

**Deliverable:**
- ✅ Inventory Dashboard ใช้งานได้เต็มรูปแบบ
- ✅ ทุก metric และ alerts แสดงผลถูกต้อง
- ✅ ครบทั้ง 4 modules หลัก

---

### 🔐 Phase 6: Permission System (วันที่ 32-40)

**เป้าหมาย:** เพิ่มระบบจัดการสิทธิ์แบบ component-level

**Tasks:**

#### 6.1 Database Setup
- [ ] สร้าง migration scripts
  - Table `roles`
  - Table `permissions`
  - Table `role_permissions`
  - Table `user_roles`

- [ ] Run migrations บน ClickHouse

#### 6.2 Permission Infrastructure
- [ ] สร้าง `/src/lib/permissions/types.ts`
  - Interfaces: Permission, Role, User

- [ ] สร้าง `/src/lib/permissions/queries.ts`
  - `getUserPermissions(userId)` - ดึง permissions ของ user
  - `getRoles()` - ดึง roles ทั้งหมด
  - `updateRolePermissions(roleId, permissions)` - อัพเดท permissions

#### 6.3 Frontend Context & Components
- [ ] สร้าง `/src/contexts/PermissionContext.tsx`
  - Provider สำหรับ permissions
  - Hook `usePermissions()`

- [ ] สร้าง `/src/components/ProtectedComponent.tsx`
  - Wrapper component สำหรับ check permissions
  - Support fallback UI

#### 6.4 Admin API
- [ ] `/src/app/api/admin/roles/route.ts` - GET, POST roles
- [ ] `/src/app/api/admin/roles/[roleId]/route.ts` - PUT, DELETE role
- [ ] `/src/app/api/admin/users/[userId]/roles/route.ts` - Assign roles

#### 6.5 Admin UI
- [ ] สร้าง `/src/app/admin/roles/page.tsx`
  - Role management UI
  - Permission tree view
  - Assign permissions to roles

- [ ] สร้าง `/src/components/admin/RoleManagement.tsx`
  - Role list
  - Permission editor with checkboxes

#### 6.6 Middleware
- [ ] สร้าง `/src/middleware.ts`
  - Server-side permission checks
  - Attach user permissions to request headers

#### 6.7 Integration
- [ ] Update `/src/app/layout.tsx`
  - Wrap with `PermissionProvider`

- [ ] Update all dashboard pages
  - Wrap KPI cards และ charts ด้วย `ProtectedComponent`
  - Test permission visibility

**Deliverable:**
- ✅ ระบบสิทธิ์ทำงานได้เต็มรูปแบบ
- ✅ Admin สามารถกำหนดสิทธิ์ได้ตาม component
- ✅ Users เห็นเฉพาะ components ที่มีสิทธิ์

---

### ✨ Phase 7: Polish & Testing (วันที่ 41-45)

**เป้าหมาย:** ปรับแต่ง, ทดสอบ, และเตรียมพร้อม production

**Tasks:**

#### 7.1 Mobile Responsive Testing
- [ ] ทดสอบทุกหน้าบน mobile devices จริง
- [ ] ปรับ breakpoints และ grid layouts
- [ ] ตรวจสอบ touch targets (min 44x44px)
- [ ] ทดสอบ charts บน mobile

#### 7.2 Performance Optimization
- [ ] Review ClickHouse queries
  - เพิ่ม indexes ที่จำเป็น
  - สร้าง materialized views สำหรับ queries ที่ช้า

- [ ] Optimize caching
  - ตรวจสอบ cache duration
  - Test cache invalidation

- [ ] Code splitting
  - Dynamic imports สำหรับ heavy components
  - Lazy load charts

#### 7.3 Error Handling
- [ ] ทดสอบ error scenarios
  - Database connection errors
  - API failures
  - Invalid date ranges

- [ ] Verify error boundaries ทำงานถูกต้อง
- [ ] Add user-friendly error messages

#### 7.4 Cross-Browser Testing
- [ ] ทดสอบบน Chrome, Firefox, Safari, Edge
- [ ] ตรวจสอบ CSS compatibility
- [ ] Fix browser-specific issues

#### 7.5 Accessibility
- [ ] ตรวจสอบ color contrast
- [ ] เพิ่ม ARIA labels สำหรับ charts
- [ ] ทดสอบ keyboard navigation
- [ ] Run accessibility audit tools

#### 7.6 Documentation
- [ ] เขียน README.md
  - Setup instructions
  - Environment variables
  - Development guide

- [ ] API documentation
  - Endpoint descriptions
  - Request/response examples

- [ ] User guide
  - How to use each dashboard
  - Permission management guide

#### 7.7 Final Review
- [ ] Code review ทั้งหมด
- [ ] Clean up console.logs และ debug code
- [ ] Check for security vulnerabilities
- [ ] Prepare for deployment

**Deliverable:**
- ✅ Dashboard พร้อม production
- ✅ Responsive ทุก devices
- ✅ Performance optimized
- ✅ Documentation ครบถ้วน

---

## ✅ Checklist สรุปทุก Phase

### Phase 1: Foundation ✓
- [ ] Data types & interfaces
- [ ] Utilities (cache, errors, dates)
- [ ] Shared components
- [ ] Dependencies installed

### Phase 2: Accounting ✓
- [ ] Data functions (7 functions)
- [ ] API routes (7 endpoints)
- [ ] UI components (6 components)
- [ ] Dashboard page complete

### Phase 3: Sales ✓
- [ ] Data functions (7 functions)
- [ ] API routes (7 endpoints)
- [ ] UI components (6 components)
- [ ] Dashboard page complete

### Phase 4: Purchase ✓
- [ ] Data functions (7 functions)
- [ ] API routes (7 endpoints)
- [ ] UI components (6 components)
- [ ] Dashboard page + menu

### Phase 5: Inventory ✓
- [ ] Data functions (7 functions)
- [ ] API routes (7 endpoints)
- [ ] UI components (6 components)
- [ ] Dashboard page complete

### Phase 6: Permissions ✓
- [ ] Database schema
- [ ] Permission logic
- [ ] Admin UI
- [ ] Integration complete

### Phase 7: Polish ✓
- [ ] Mobile tested
- [ ] Performance optimized
- [ ] Errors handled
- [ ] Documentation done

---

## 📊 Timeline Summary

| Phase | Duration | Days | Focus |
|-------|----------|------|-------|
| Phase 1 | 3 days | 1-3 | Foundation |
| Phase 2 | 7 days | 4-10 | Accounting |
| Phase 3 | 7 days | 11-17 | Sales |
| Phase 4 | 7 days | 18-24 | Purchase |
| Phase 5 | 7 days | 25-31 | Inventory |
| Phase 6 | 9 days | 32-40 | Permissions |
| Phase 7 | 5 days | 41-45 | Polish |
| **Total** | **45 days** | ~**6-7 สัปดาห์** | |

---

## 🎯 แนะนำการทำงาน

1. **ทำทีละ Phase** - อย่าข้าม phase
2. **ทดสอบก่อนไป phase ถัดไป** - ให้แน่ใจว่า phase ปัจจุบันใช้งานได้
3. **Commit บ่อยๆ** - Commit หลังจากทำแต่ละ task สำคัญ
4. **Review queries** - ทดสอบ ClickHouse queries ก่อนเอาไปใช้
5. **Mock data** - ใช้ mock data ทดสอบ UI ระหว่างพัฒนา

---

## 11. Dependencies

**ต้องติดตั้ง:**
```json
{
  "dependencies": {
    "date-fns": "^3.0.0",    // Date manipulation
    "zod": "^3.22.0"          // Schema validation
  }
}
```

**Optional (แนะนำ):**
```json
{
  "dependencies": {
    "swr": "^2.2.0"           // Client-side caching (ถ้าต้องการ)
  }
}
```

---

## 12. Performance Optimization

### 12.1 Database Optimization

**Materialized Views (แนะนำ):**
```sql
-- Daily Sales Summary
CREATE MATERIALIZED VIEW daily_sales_summary
ENGINE = SummingMergeTree()
ORDER BY (date, branch_code)
AS SELECT
  toDate(doc_datetime) as date,
  branch_code,
  sum(total_amount) as total_sales,
  count(doc_no) as order_count
FROM saleinvoice_transaction
WHERE status_cancel != 'Cancel'
GROUP BY date, branch_code;
```

### 12.2 Caching
- API responses: cache 5 minutes (300s)
- Static data (branches, categories): cache 1 hour
- User permissions: cache 15 minutes

### 12.3 Code Splitting
```typescript
// Dynamic imports for heavy charts
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

---

## 13. Best Practices

### 13.1 Date Range Handling
- Default: This Month
- ให้เลือก predefined ranges + custom
- แสดงเปรียบเทียบกับงวดก่อน (MoM, YoY)

### 13.2 Loading States
- ใช้ Suspense boundaries
- Skeleton loaders ทุก component
- Error boundaries ครอบทุกหน้า

### 13.3 Mobile UX
- ปุ่มขนาดพอแตะได้ (min 44x44px)
- Charts responsive (min-height)
- Tables: ซ่อนบาง columns บน mobile
- Filters: ย่อเป็น dropdown บน mobile

### 13.4 Accessibility
- Semantic HTML
- ARIA labels สำหรับ charts
- Keyboard navigation
- Color contrast ratio ≥ 4.5:1

---

## 14. Critical Files Summary

### ไฟล์สำคัญที่ต้องอ่านก่อนเริ่ม:
1. `/src/lib/clickhouse.ts` - ClickHouse connection
2. `/src/lib/data.ts` - ตัวอย่าง query functions ที่มีอยู่
3. `/src/app/layout.tsx` - Root layout structure
4. `/src/components/KPICard.tsx` - KPI card component
5. `/src/components/DataCard.tsx` - Data card wrapper

### ไฟล์ที่ต้องแก้ไข:
1. `/src/app/accounting/page.tsx` - เพิ่ม components ครบ
2. `/src/app/sales/page.tsx` - เพิ่ม components ครบ
3. `/src/app/inventory/page.tsx` - เพิ่ม components ครบ
4. `/src/components/Sidebar.tsx` - เพิ่ม "ซื้อ" menu

### ไฟล์ใหม่ทั้งหมด: ~80+ files
- Data functions: 5 files
- API routes: ~28 routes
- Components: ~25 components
- Permission system: ~10 files
- Utilities: 5 files

---

## 15. Notes & Recommendations

### สิ่งที่ต้องระวัง:
1. **ClickHouse queries อาจต้องปรับ** - ขึ้นกับ schema จริงและ performance
2. **Permission system ต้องทดสอบดี** - เพื่อความปลอดภัย
3. **Mobile testing จริง** - อย่าพึ่งแค่ browser DevTools
4. **Cache invalidation** - ต้องมีกลไกล้างCache เมื่อข้อมูลเปลี่ยน

### คำแนะนำเพิ่มเติม:
1. ทำทีละ module (Accounting → Sales → Purchase → Inventory)
2. Test แต่ละ module ให้ดีก่อนไปต่อ
3. เริ่มจาก API + Data layer ก่อน จึงค่อยทำ UI
4. ใช้ mock data ทดสอบ UI ระหว่างพัฒนา

---

## สรุป

แผนนี้ครอบคลุม:
- ✅ 4 Dashboard modules (Accounting, Sales, Purchase, Inventory)
- ✅ ClickHouse queries พร้อมใช้ (ปรับแต่งได้ตามต้องการ)
- ✅ Component-level permissions
- ✅ Mobile responsive design
- ✅ Clean, minimal UI
- ✅ Performance optimization strategies
- ✅ Implementation roadmap ชัดเจน

**ประมาณการ:** ~6-7 สัปดาห์สำหรับการพัฒนาครบทั้ง 4 modules + permission system
