// Inventory data queries for ClickHouse

import { clickhouse } from '@/lib/clickhouse';
import type {
  DateRange,
  InventoryKPIs,
  StockMovement,
  LowStockItem,
  OverstockItem,
  SlowMovingItem,
  InventoryTurnover,
  StockByBranch,
  KPIData,
} from './types';
import { calculateGrowth, getPreviousPeriod } from '@/lib/comparison';

/**
 * Get Inventory KPIs: Total inventory value, items in stock, low stock alerts, overstock alerts
 * Note: stock_transaction table has qty (>0=in, <0=out), cost, amount
 * We calculate current stock by summing qty per item
 */
export async function getInventoryKPIs(asOfDate: string): Promise<InventoryKPIs> 
{
  try {
    // Calculate current stock per item by summing qty (in/out movements)
    // Total Inventory Value (sum of qty * cost for items with positive stock)
    const valueQuery = `
      SELECT
        sum(total_value) as current_value
      FROM (
        SELECT
          item_code,
          sum(qty) as total_qty,
          sum(qty * cost) as total_value
        FROM stock_transaction
        WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
        GROUP BY item_code
        HAVING total_qty > 0
      )
    `;

    // Total Items in Stock (items with positive stock balance)
    const itemsQuery = `
      SELECT
        count(*) as current_value
      FROM (
        SELECT
          item_code,
          sum(qty) as total_qty
        FROM stock_transaction
        WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
        GROUP BY item_code
        HAVING total_qty > 0
      )
    `;

    // Low Stock Items - items with stock <= 10 units (arbitrary threshold since no reorder_point column)
    const lowStockQuery = `
      SELECT
        count(*) as current_value
      FROM (
        SELECT
          item_code,
          sum(qty) as total_qty
        FROM stock_transaction
        WHERE toDate(doc_datetime) <=toDate('${asOfDate}')
        GROUP BY item_code
        HAVING total_qty > 0 AND total_qty <= 10
      )
    `;

    // Overstock Items - items with stock > 1000 units (arbitrary threshold since no max_stock_level column)
    const overstockQuery = `
      SELECT
        count(*) as current_value
      FROM (
        SELECT
          item_code,
          sum(qty) as total_qty
        FROM stock_transaction
        WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
        GROUP BY item_code
        HAVING total_qty > 1000
      )
    `;

    const params = { as_of_date: asOfDate };

    const [valueResult, itemsResult, lowStockResult, overstockResult] = await Promise.all([
      clickhouse.query({ query: valueQuery, query_params: params, format: 'JSONEachRow' }),
      clickhouse.query({ query: itemsQuery, query_params: params, format: 'JSONEachRow' }),
      clickhouse.query({ query: lowStockQuery, query_params: params, format: 'JSONEachRow' }),
      clickhouse.query({ query: overstockQuery, query_params: params, format: 'JSONEachRow' }),
    ]);

    const valueData = await valueResult.json();
    const itemsData = await itemsResult.json();
    const lowStockData = await lowStockResult.json();
    const overstockData = await overstockResult.json();

    const createKPI = (data: any[]): KPIData => {
      const row = data[0] || { current_value: 0 };
      const current = Number(row.current_value) || 0;

      return {
        value: current,
        previousValue: 0,
        growth: 0,
        growthPercentage: 0,
        trend: 'neutral',
      };
    };

    return {
      totalInventoryValue: createKPI(valueData),
      totalItems: createKPI(itemsData),
      totalItemsInStock: createKPI(itemsData),
      lowStockItems: createKPI(lowStockData),
      lowStockAlerts: createKPI(lowStockData),
      overstockItems: createKPI(overstockData),
      overstockAlerts: createKPI(overstockData),
    };
  } catch (error) {
    console.error('Error fetching inventory KPIs:', error);
    throw error;
  }
}

/**
 * Get Stock Movement (IN/OUT) over time
 */
export async function getStockMovement(dateRange: DateRange): Promise<StockMovement[]> {
    const previousPeriod = getPreviousPeriod(dateRange, 'PreviousPeriod');
  try {
    const query = `
      SELECT
        toStartOfDay(doc_datetime) as date,
        sumIf(qty, qty > 0) as qtyIn,
        sumIf(abs(qty), qty < 0) as qtyOut
      FROM stock_transaction
      WHERE doc_datetime BETWEEN '${dateRange.start}' AND '${dateRange.end}'
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
      qtyIn: Number(row.qtyIn) || 0,
      qtyOut: Number(row.qtyOut) || 0,
    }));
  } catch (error) {
    console.error('Error fetching stock movement:', error);
    throw error;
  }
}

/**
 * Get Low Stock Items (items with stock balance <= 10 units)
 */
export async function getLowStockItems(asOfDate: string): Promise<LowStockItem[]> {
  try {
    const query = `
      SELECT
        item_code as itemCode,
        any(item_name) as itemName,
        any(item_category_name) as categoryName,
        any(item_brand_name) as brandName,
        any(wh_name) as whName,
        any(wh_name) as branchName,
        sum(qty) as currentStock,
        10 as reorderPoint,
        if(sum(qty) > 0, sum(qty * cost) / sum(qty), 0) as costAvg
      FROM stock_transaction
      WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
      GROUP BY item_code
      HAVING currentStock > 0 AND currentStock <= 10
      ORDER BY currentStock ASC
      LIMIT 50
    `;

    const result = await clickhouse.query({
      query,
      query_params: { as_of_date: asOfDate },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      itemCode: row.itemCode,
      itemName: row.itemName,
      categoryName: row.categoryName || '-',
      brandName: row.brandName || '-',
      whName: row.whName || '-',
      branchName: row.branchName || '-',
      currentStock: Number(row.currentStock) || 0,
      qtyOnHand: Number(row.currentStock) || 0,
      reorderPoint: Number(row.reorderPoint) || 10,
      stockValue: Number(row.currentStock) * Number(row.costAvg) || 0,
    }));
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
}

/**
 * Get Overstock Items (items with stock > 1000 units)
 */
export async function getOverstockItems(asOfDate: string): Promise<OverstockItem[]> {
  try {
    const query = `
      SELECT
        item_code as itemCode,
        any(item_name) as itemName,
        any(item_category_name) as categoryName,
        any(item_brand_name) as brandName,
        any(wh_name) as branchName,
        sum(qty) as currentStock,
        1000 as maxStockLevel,
        if(sum(qty) > 0, sum(qty * cost) / sum(qty), 0) as costAvg
      FROM stock_transaction
      WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
      GROUP BY item_code
      HAVING currentStock > 1000
      ORDER BY currentStock DESC
      LIMIT 50
    `;

    const result = await clickhouse.query({
      query,
      query_params: { as_of_date: asOfDate },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => {
      const currentStock = Number(row.currentStock) || 0;
      const costAvg = Number(row.costAvg) || 0;
      const maxStockLevel = Number(row.maxStockLevel) || 1000;
      return {
        itemCode: row.itemCode,
        itemName: row.itemName,
        categoryName: row.categoryName || '-',
        brandName: row.brandName || '-',
        branchName: row.branchName || '-',
        currentStock: currentStock,
        qtyOnHand: currentStock,
        maxStockLevel: maxStockLevel,
        stockValue: currentStock * costAvg,
        valueExcess: (currentStock - maxStockLevel) * costAvg,
      };
    });
  } catch (error) {
    console.error('Error fetching overstock items:', error);
    throw error;
  }
}

/**
 * Get Slow Moving Items (items with low turnover)
 * Calculate current stock by summing qty movements
 */
export async function getSlowMovingItems(dateRange: DateRange, asOfDate: string): Promise<SlowMovingItem[]> {
  try {
    const query = `
      SELECT
        stock.item_code as itemCode,
        stock.item_name as itemName,
        stock.categoryName as categoryName,
        stock.brandName as brandName,
        stock.currentStock as currentStock,
        stock.costAvg as costAvg,
        stock.stockValue as stockValue,
        coalesce(sales.qty_sold, 0) as qtySold,
        dateDiff('day', toDate('${dateRange.start}'), toDate('${dateRange.end}')) as daysPeriod,
        if(sales.qty_sold > 0, stock.currentStock / (sales.qty_sold / daysPeriod), 999) as daysOfStock
      FROM (
        SELECT
          item_code,
          any(item_name) as item_name,
          any(item_category_name) as categoryName,
          any(item_brand_name) as brandName,
          sum(qty) as currentStock,
          if(sum(qty) > 0, sum(qty * cost) / sum(qty), 0) as costAvg,
          sum(qty * cost) as stockValue
        FROM stock_transaction
        WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
        GROUP BY item_code
        HAVING currentStock > 0
      ) stock
      LEFT JOIN (
        SELECT
          sid.item_code,
          sum(sid.qty) as qty_sold
        FROM saleinvoice_transaction_detail sid
        JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no AND sid.branch_sync = si.branch_sync
        WHERE si.status_cancel != 'Cancel'
          AND toDate(si.doc_datetime) BETWEEN toDate('${dateRange.start}') AND toDate('${dateRange.end}')
        GROUP BY sid.item_code
      ) sales ON stock.item_code = sales.item_code
      WHERE daysOfStock > 90
      ORDER BY stockValue DESC
      LIMIT 50
    `;

    const result = await clickhouse.query({
      query,
      query_params: {
        start_date: dateRange.start,
        end_date: dateRange.end,
        as_of_date: asOfDate,
      },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => {
      const currentStock = Number(row.currentStock) || 0;
      const costAvg = Number(row.costAvg) || 0;
      return {
        itemCode: row.itemCode,
        itemName: row.itemName,
        categoryName: row.categoryName || '-',
        brandName: row.brandName || '-',
        currentStock: currentStock,
        qtyOnHand: currentStock,
        costAvg: costAvg,
        stockValue: Number(row.stockValue) || 0,
        inventoryValue: Number(row.stockValue) || 0,
        qtySold: Number(row.qtySold) || 0,
        daysOfStock: Number(row.daysOfStock) || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching slow moving items:', error);
    throw error;
  }
}

/**
 * Get Inventory Turnover by Category
 * Calculate using stock movements (qty) instead of non-existent columns
 */
export async function getInventoryTurnover(dateRange: DateRange, asOfDate: string): Promise<InventoryTurnover[]> {
  try {
    const query = `
      SELECT
        stock.categoryName as categoryName,
        stock.avgInventoryValue as avgInventoryValue,
        coalesce(sales.totalCOGS, 0) as totalCOGS,
        if(stock.avgInventoryValue > 0, coalesce(sales.totalCOGS, 0) / stock.avgInventoryValue, 0) as turnoverRatio,
        if(turnoverRatio > 0, 365 / turnoverRatio, 0) as daysToSell
      FROM (
        SELECT
          item_category_name as categoryName,
          sum(qty * cost) as avgInventoryValue
        FROM stock_transaction
        WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
          AND item_category_name != ''
        GROUP BY item_category_name
        HAVING avgInventoryValue > 0
      ) stock
      LEFT JOIN (
        SELECT
          sid.item_category_name as categoryName,
          sum(sid.sum_of_cost) as totalCOGS
        FROM saleinvoice_transaction_detail sid
        JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no AND sid.branch_sync = si.branch_sync
        WHERE si.status_cancel != 'Cancel'
          AND si.doc_datetime BETWEEN '${dateRange.start}' AND '${dateRange.end}'
        GROUP BY sid.item_category_name
      ) sales ON stock.categoryName = sales.categoryName
      ORDER BY turnoverRatio DESC
      LIMIT 15
    `;

    const result = await clickhouse.query({
      query,
      query_params: {
        start_date: dateRange.start,
        end_date: dateRange.end,
        as_of_date: asOfDate,
      },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => {
      const turnoverRatio = Number(row.turnoverRatio) || 0;
      const daysToSell = Number(row.daysToSell) || 0;
      return {
        itemCode: '', // Category-level aggregation, no specific item
        itemName: row.categoryName || 'ไม่ระบุ',
        categoryName: row.categoryName || 'ไม่ระบุ',
        totalCOGS: Number(row.totalCOGS) || 0,
        avgInventoryValue: Number(row.avgInventoryValue) || 0,
        turnoverRatio: turnoverRatio,
        daysInventoryOutstanding: daysToSell,
        daysToSell: daysToSell,
      };
    });
  } catch (error) {
    console.error('Error fetching inventory turnover:', error);
    throw error;
  }
}

/**
 * Get Stock by Branch
 * Note: stock_transaction doesn't have branch_code/branch_name, using wh_code/wh_name (warehouse) instead
 */
export async function getStockByBranch(asOfDate: string): Promise<StockByBranch[]> {
  try {
    const query = `
      SELECT
        wh_code as branchCode,
        any(wh_name) as branchName,
        count(DISTINCT item_code) as itemCount,
        sum(qty) as qtyOnHand,
        sum(qty * cost) as inventoryValue
      FROM stock_transaction
      WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
        AND wh_code != ''
      GROUP BY wh_code
      HAVING qtyOnHand > 0
      ORDER BY inventoryValue DESC
    `;

    const result = await clickhouse.query({
      query,
      query_params: { as_of_date: asOfDate },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data.map((row: any) => ({
      branchCode: row.branchCode,
      branchName: row.branchName || row.branchCode,
      itemCount: Number(row.itemCount) || 0,
      qtyOnHand: Number(row.qtyOnHand) || 0,
      inventoryValue: Number(row.inventoryValue) || 0,
    }));
  } catch (error) {
    console.error('Error fetching stock by branch:', error);
    throw error;
  }
}

// ============================================
// Query Functions for SQL Popup Display
// ============================================

export function getInventoryValueQuery(asOfDate: string): string {
  return `SELECT
  sum(total_value) as current_value
FROM (
  SELECT
    item_code,
    sum(qty) as total_qty,
    sum(qty * cost) as total_value
  FROM stock_transaction
  WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
  GROUP BY item_code
  HAVING total_qty > 0
)`;
}

export function getTotalItemsQuery(asOfDate: string): string {
  return `SELECT
  count(*) as current_value
FROM (
  SELECT
    item_code,
    sum(qty) as total_qty
  FROM stock_transaction
  WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
  GROUP BY item_code
  HAVING total_qty > 0
)`;
}

export function getLowStockCountQuery(asOfDate: string): string {
  return `SELECT
  count(*) as current_value
FROM (
  SELECT
    item_code,
    sum(qty) as total_qty
  FROM stock_transaction
  WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
  GROUP BY item_code
  HAVING total_qty > 0 AND total_qty <= 10
)`;
}

export function getOverstockCountQuery(asOfDate: string): string {
  return `SELECT
  count(*) as current_value
FROM (
  SELECT
    item_code,
    sum(qty) as total_qty
  FROM stock_transaction
  WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
  GROUP BY item_code
  HAVING total_qty > 1000
)`;
}

export function getStockMovementQuery(startDate: string, endDate: string): string {
  return `SELECT
  toStartOfDay(doc_datetime) as date,
  sumIf(qty, qty > 0) as qtyIn,
  sumIf(abs(qty), qty < 0) as qtyOut
FROM stock_transaction
WHERE doc_datetime BETWEEN '${startDate}' AND '${endDate}'
GROUP BY date
ORDER BY date ASC`;
}

export function getLowStockItemsQuery(asOfDate: string): string {
  return `SELECT
  item_code as itemCode,
  any(item_name) as itemName,
  any(item_category_name) as categoryName,
  any(item_brand_name) as brandName,
  any(wh_name) as whName,
  any(wh_name) as branchName,
  sum(qty) as currentStock,
  10 as reorderPoint,
  if(sum(qty) > 0, sum(qty * cost) / sum(qty), 0) as costAvg
FROM stock_transaction
WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
GROUP BY item_code
HAVING currentStock > 0 AND currentStock <= 10
ORDER BY currentStock ASC
LIMIT 50`;
}

export function getOverstockItemsQuery(asOfDate: string): string {
  return `SELECT
  item_code as itemCode,
  any(item_name) as itemName,
  any(item_category_name) as categoryName,
  any(item_brand_name) as brandName,
  any(wh_name) as branchName,
  sum(qty) as currentStock,
  1000 as maxStockLevel,
  if(sum(qty) > 0, sum(qty * cost) / sum(qty), 0) as costAvg
FROM stock_transaction
WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
GROUP BY item_code
HAVING currentStock > 1000
ORDER BY currentStock DESC
LIMIT 50`;
}

export function getSlowMovingItemsQuery(startDate: string, endDate: string, asOfDate: string): string {
  return `SELECT
  stock.item_code as itemCode,
  stock.item_name as itemName,
  stock.categoryName as categoryName,
  stock.brandName as brandName,
  stock.currentStock as currentStock,
  stock.costAvg as costAvg,
  stock.stockValue as stockValue,
  coalesce(sales.qty_sold, 0) as qtySold,
  dateDiff('day', toDate('${startDate}'), toDate('${endDate}')) as daysPeriod,
  if(sales.qty_sold > 0, stock.currentStock / (sales.qty_sold / daysPeriod), 999) as daysOfStock
FROM (
  SELECT
    item_code,
    any(item_name) as item_name,
    any(item_category_name) as categoryName,
    any(item_brand_name) as brandName,
    sum(qty) as currentStock,
    if(sum(qty) > 0, sum(qty * cost) / sum(qty), 0) as costAvg,
    sum(qty * cost) as stockValue
  FROM stock_transaction
  WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
  GROUP BY item_code
  HAVING currentStock > 0
) stock
LEFT JOIN (
  SELECT
    sid.item_code,
    sum(sid.qty) as qty_sold
  FROM saleinvoice_transaction_detail sid
  JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no AND sid.branch_sync = si.branch_sync
  WHERE si.status_cancel != 'Cancel'
    AND toDate(si.doc_datetime) BETWEEN toDate('${startDate}') AND toDate('${endDate}')
  GROUP BY sid.item_code
) sales ON stock.item_code = sales.item_code
WHERE daysOfStock > 90
ORDER BY stockValue DESC
LIMIT 50`;
}

export function getInventoryTurnoverQuery(startDate: string, endDate: string, asOfDate: string): string {
  return `SELECT
  stock.categoryName as categoryName,
  stock.avgInventoryValue as avgInventoryValue,
  coalesce(sales.totalCOGS, 0) as totalCOGS,
  if(stock.avgInventoryValue > 0, coalesce(sales.totalCOGS, 0) / stock.avgInventoryValue, 0) as turnoverRatio,
  if(turnoverRatio > 0, 365 / turnoverRatio, 0) as daysToSell
FROM (
  SELECT
    item_category_name as categoryName,
    sum(qty * cost) as avgInventoryValue
  FROM stock_transaction
  WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
    AND item_category_name != ''
  GROUP BY item_category_name
  HAVING avgInventoryValue > 0
) stock
LEFT JOIN (
  SELECT
    sid.item_category_name as categoryName,
    sum(sid.sum_of_cost) as totalCOGS
  FROM saleinvoice_transaction_detail sid
  JOIN saleinvoice_transaction si ON sid.doc_no = si.doc_no AND sid.branch_sync = si.branch_sync
  WHERE si.status_cancel != 'Cancel'
    AND si.doc_datetime BETWEEN '${startDate}' AND '${endDate}'
  GROUP BY sid.item_category_name
) sales ON stock.categoryName = sales.categoryName
ORDER BY turnoverRatio DESC
LIMIT 15`;
}

export function getStockByBranchQuery(asOfDate: string): string {
  return `SELECT
  wh_code as branchCode,
  any(wh_name) as branchName,
  count(DISTINCT item_code) as itemCount,
  sum(qty) as qtyOnHand,
  sum(qty * cost) as inventoryValue
FROM stock_transaction
WHERE toDate(doc_datetime) <= toDate('${asOfDate}')
  AND wh_code != ''
GROUP BY wh_code
HAVING qtyOnHand > 0
ORDER BY inventoryValue DESC`;
}
