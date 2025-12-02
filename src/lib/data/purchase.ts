// Purchase data queries for ClickHouse

import { clickhouse } from '@/lib/clickhouse';
import type {
  DateRange,
  PurchaseKPIs,
  PurchaseTrendData,
  TopSupplier,
  PurchaseByCategory,
  PurchaseByBrand,
  APOutstanding,
  KPIData,
} from './types';
import { calculateGrowth, getPreviousPeriod } from '@/lib/comparison';

/**
 * Get Purchase KPIs: Total purchases, items purchased, orders, avg order value
 */
export async function getPurchaseKPIs(dateRange: DateRange): Promise<PurchaseKPIs> {
  try {
    const previousPeriod = getPreviousPeriod(dateRange, 'PreviousPeriod');

    // Total Purchases
    const purchaseQuery = `
      SELECT
        sum(total_amount) as current_value,
        (SELECT sum(total_amount)
         FROM purchase_transaction
         WHERE status_cancel != 'Cancel'
           AND doc_datetime BETWEEN {previous_start:String} AND {previous_end:String}) as previous_value
      FROM purchase_transaction
      WHERE status_cancel != 'Cancel'
        AND doc_datetime BETWEEN {start_date:String} AND {end_date:String}
    `;

    // Total Items Purchased
    const itemsQuery = `
      SELECT
        sum(qty) as current_value,
        (SELECT sum(qty)
         FROM purchase_transaction_detail ptd
         JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no AND ptd.branch_sync = pt.branch_sync
         WHERE pt.status_cancel != 'Cancel'
           AND pt.doc_datetime BETWEEN {previous_start:String} AND {previous_end:String}) as previous_value
      FROM purchase_transaction_detail ptd
      JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no AND ptd.branch_sync = pt.branch_sync
      WHERE pt.status_cancel != 'Cancel'
        AND pt.doc_datetime BETWEEN {start_date:String} AND {end_date:String}
    `;

    // Total Orders
    const ordersQuery = `
      SELECT
        count(DISTINCT doc_no) as current_value,
        (SELECT count(DISTINCT doc_no)
         FROM purchase_transaction
         WHERE status_cancel != 'Cancel'
           AND doc_datetime BETWEEN {previous_start:String} AND {previous_end:String}) as previous_value
      FROM purchase_transaction
      WHERE status_cancel != 'Cancel'
        AND doc_datetime BETWEEN {start_date:String} AND {end_date:String}
    `;

    // Average Order Value
    const avgOrderQuery = `
      SELECT
        avg(total_amount) as current_value,
        (SELECT avg(total_amount)
         FROM purchase_transaction
         WHERE status_cancel != 'Cancel'
           AND doc_datetime BETWEEN {previous_start:String} AND {previous_end:String}) as previous_value
      FROM purchase_transaction
      WHERE status_cancel != 'Cancel'
        AND doc_datetime BETWEEN {start_date:String} AND {end_date:String}
    `;

    const params = {
      start_date: dateRange.start,
      end_date: dateRange.end,
      previous_start: previousPeriod.start,
      previous_end: previousPeriod.end,
    };

    const [purchaseResult, itemsResult, ordersResult, avgOrderResult] = await Promise.all([
      clickhouse.query({ query: purchaseQuery, query_params: params, format: 'JSONEachRow' }),
      clickhouse.query({ query: itemsQuery, query_params: params, format: 'JSONEachRow' }),
      clickhouse.query({ query: ordersQuery, query_params: params, format: 'JSONEachRow' }),
      clickhouse.query({ query: avgOrderQuery, query_params: params, format: 'JSONEachRow' }),
    ]);

    const purchaseData = await purchaseResult.json();
    const itemsData = await itemsResult.json();
    const ordersData = await ordersResult.json();
    const avgOrderData = await avgOrderResult.json();

    const createKPI = (data: any[]): KPIData => {
      const row = data[0] || { current_value: 0, previous_value: 0 };
      const current = Number(row.current_value) || 0;
      const previous = Number(row.previous_value) || 0;
      const growth = calculateGrowth(current, previous);

      return {
        value: current,
        previousValue: previous,
        growth: growth.value,
        growthPercentage: growth.percentage,
        trend: growth.trend,
      };
    };

    return {
      totalPurchases: createKPI(purchaseData),
      totalItemsPurchased: createKPI(itemsData),
      totalOrders: createKPI(ordersData),
      avgOrderValue: createKPI(avgOrderData),
    };
  } catch (error) {
    console.error('Error fetching purchase KPIs:', error);
    throw error;
  }
}

/**
 * Get Purchase Trend data by day
 */
export async function getPurchaseTrendData(dateRange: DateRange): Promise<PurchaseTrendData[]> {
  try {
    const query = `
      SELECT
        toStartOfDay(doc_datetime) as date,
        sum(total_amount) as purchases,
        count(DISTINCT doc_no) as orderCount
      FROM purchase_transaction
      WHERE status_cancel != 'Cancel'
        AND doc_datetime BETWEEN {start_date:String} AND {end_date:String}
      GROUP BY date
      ORDER BY date ASC
    `;

    const result = await clickhouse.query({
      query,
      query_params: { start_date: dateRange.start, end_date: dateRange.end },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      date: row.date,
      purchases: Number(row.purchases) || 0,
      orderCount: Number(row.orderCount) || 0,
    }));
  } catch (error) {
    console.error('Error fetching purchase trend:', error);
    throw error;
  }
}

/**
 * Get Top Suppliers
 */
export async function getTopSuppliers(dateRange: DateRange): Promise<TopSupplier[]> {
  try {
    const query = `
      SELECT
        supplier_code as supplierCode,
        supplier_name as supplierName,
        count(DISTINCT doc_no) as orderCount,
        sum(total_amount) as totalPurchases,
        avg(total_amount) as avgOrderValue,
        max(doc_datetime) as lastOrderDate,
        dateDiff('day', lastOrderDate, now()) as daysSinceLastOrder
      FROM purchase_transaction
      WHERE status_cancel != 'Cancel'
        AND supplier_code != ''
        AND doc_datetime BETWEEN {start_date:String} AND {end_date:String}
      GROUP BY supplier_code, supplier_name
      ORDER BY totalPurchases DESC
      LIMIT 20
    `;

    const result = await clickhouse.query({
      query,
      query_params: { start_date: dateRange.start, end_date: dateRange.end },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      supplierCode: row.supplierCode,
      supplierName: row.supplierName,
      orderCount: Number(row.orderCount) || 0,
      totalPurchases: Number(row.totalPurchases) || 0,
      avgOrderValue: Number(row.avgOrderValue) || 0,
      lastOrderDate: row.lastOrderDate,
      daysSinceLastOrder: Number(row.daysSinceLastOrder) || 0,
    }));
  } catch (error) {
    console.error('Error fetching top suppliers:', error);
    throw error;
  }
}

/**
 * Get Purchase by Category
 */
export async function getPurchaseByCategory(dateRange: DateRange): Promise<PurchaseByCategory[]> {
  try {
    const query = `
      SELECT
        ptd.item_category_name as categoryName,
        sum(ptd.qty) as totalQty,
        sum(ptd.sum_amount) as totalAmount,
        count(DISTINCT ptd.doc_no) as orderCount
      FROM purchase_transaction_detail ptd
      JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no AND ptd.branch_sync = pt.branch_sync
      WHERE pt.status_cancel != 'Cancel'
        AND pt.doc_datetime BETWEEN {start_date:String} AND {end_date:String}
        AND ptd.item_category_name != ''
      GROUP BY ptd.item_category_name
      ORDER BY totalAmount DESC
      LIMIT 15
    `;

    const result = await clickhouse.query({
      query,
      query_params: { start_date: dateRange.start, end_date: dateRange.end },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      categoryName: row.categoryName || 'ไม่ระบุ',
      totalQty: Number(row.totalQty) || 0,
      totalAmount: Number(row.totalAmount) || 0,
      orderCount: Number(row.orderCount) || 0,
    }));
  } catch (error) {
    console.error('Error fetching purchase by category:', error);
    throw error;
  }
}

/**
 * Get Purchase by Brand
 */
export async function getPurchaseByBrand(dateRange: DateRange): Promise<PurchaseByBrand[]> {
  try {
    const query = `
      SELECT
        ptd.item_brand_name as brandName,
        sum(ptd.qty) as totalQty,
        sum(ptd.sum_amount) as totalAmount,
        count(DISTINCT ptd.doc_no) as orderCount,
        uniq(ptd.item_code) as productCount
      FROM purchase_transaction_detail ptd
      JOIN purchase_transaction pt ON ptd.doc_no = pt.doc_no AND ptd.branch_sync = pt.branch_sync
      WHERE pt.status_cancel != 'Cancel'
        AND pt.doc_datetime BETWEEN {start_date:String} AND {end_date:String}
        AND ptd.item_brand_name != ''
      GROUP BY ptd.item_brand_name
      ORDER BY totalAmount DESC
      LIMIT 15
    `;

    const result = await clickhouse.query({
      query,
      query_params: { start_date: dateRange.start, end_date: dateRange.end },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      brandName: row.brandName || 'ไม่ระบุ',
      totalQty: Number(row.totalQty) || 0,
      totalAmount: Number(row.totalAmount) || 0,
      orderCount: Number(row.orderCount) || 0,
      productCount: Number(row.productCount) || 0,
    }));
  } catch (error) {
    console.error('Error fetching purchase by brand:', error);
    throw error;
  }
}

/**
 * Get AP Outstanding (Accounts Payable)
 */
export async function getAPOutstanding(dateRange: DateRange): Promise<APOutstanding[]> {
  try {
    const query = `
      SELECT
        status_payment as statusPayment,
        count(DISTINCT doc_no) as invoiceCount,
        sum(total_amount) as totalInvoiceAmount,
        sum(sum_pay_money) as totalPaid,
        sum(total_amount - sum_pay_money) as totalOutstanding
      FROM purchase_transaction
      WHERE status_cancel != 'Cancel'
        AND doc_type = 'CREDIT'
        AND doc_datetime BETWEEN {start_date:String} AND {end_date:String}
      GROUP BY statusPayment
      ORDER BY totalOutstanding DESC
    `;

    const result = await clickhouse.query({
      query,
      query_params: { start_date: dateRange.start, end_date: dateRange.end },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      statusPayment: row.statusPayment,
      invoiceCount: Number(row.invoiceCount) || 0,
      totalInvoiceAmount: Number(row.totalInvoiceAmount) || 0,
      totalPaid: Number(row.totalPaid) || 0,
      totalOutstanding: Number(row.totalOutstanding) || 0,
    }));
  } catch (error) {
    console.error('Error fetching AP outstanding:', error);
    throw error;
  }
}
