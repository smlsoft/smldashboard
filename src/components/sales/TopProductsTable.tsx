'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { TopProduct } from '@/lib/data/types';

interface TopProductsTableProps {
  data: TopProduct[];
}

type SortField = 'itemName' | 'totalSales' | 'totalQtySold' | 'profitMarginPct';
type SortOrder = 'asc' | 'desc';

export function TopProductsTable({ data }: TopProductsTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalSales');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'itemName':
        aVal = a.itemName;
        bVal = b.itemName;
        break;
      case 'totalSales':
        aVal = a.totalSales;
        bVal = b.totalSales;
        break;
      case 'totalQtySold':
        aVal = a.totalQtySold;
        bVal = b.totalQtySold;
        break;
      case 'profitMarginPct':
        aVal = a.profitMarginPct;
        bVal = b.profitMarginPct;
        break;
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีข้อมูลสินค้า
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 font-medium">ลำดับ</th>
            <th
              className="text-left py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('itemName')}
            >
              <div className="flex items-center gap-1">
                สินค้า
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('totalQtySold')}
            >
              <div className="flex items-center justify-end gap-1">
                จำนวนขาย
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('totalSales')}
            >
              <div className="flex items-center justify-end gap-1">
                ยอดขาย
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('profitMarginPct')}
            >
              <div className="flex items-center justify-end gap-1">
                กำไรขั้นต้น (%)
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={item.itemCode} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
              <td className="py-2 px-2">
                <div className="font-medium">{item.itemName}</div>
                <div className="text-xs text-muted-foreground">
                  {item.brandName} • {item.categoryName}
                </div>
              </td>
              <td className="py-2 px-2 text-right">
                {formatCurrency(item.totalQtySold)}
              </td>
              <td className="py-2 px-2 text-right font-medium">
                ฿{formatCurrency(item.totalSales)}
              </td>
              <td className="py-2 px-2 text-right">
                <span
                  className={
                    item.profitMarginPct >= 30
                      ? 'text-green-600'
                      : item.profitMarginPct >= 15
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }
                >
                  {item.profitMarginPct.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
