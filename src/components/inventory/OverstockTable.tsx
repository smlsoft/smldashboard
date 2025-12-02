'use client';

import { useState } from 'react';
import { ArrowUpDown, AlertCircle } from 'lucide-react';
import type { OverstockItem } from '@/lib/data/types';

interface OverstockTableProps {
  data: OverstockItem[];
}

type SortField = 'itemName' | 'qtyOnHand' | 'maxStockLevel' | 'valueExcess';
type SortOrder = 'asc' | 'desc';

export function OverstockTable({ data }: OverstockTableProps) {
  const [sortField, setSortField] = useState<SortField>('valueExcess');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].map(item => ({
    ...item,
    excess: item.qtyOnHand - item.maxStockLevel,
    excessPercent: ((item.qtyOnHand - item.maxStockLevel) / item.maxStockLevel) * 100,
  })).sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'itemName':
        aVal = a.itemName;
        bVal = b.itemName;
        break;
      case 'qtyOnHand':
        aVal = a.qtyOnHand;
        bVal = b.qtyOnHand;
        break;
      case 'maxStockLevel':
        aVal = a.maxStockLevel;
        bVal = b.maxStockLevel;
        break;
      case 'valueExcess':
        aVal = a.valueExcess;
        bVal = b.valueExcess;
        break;
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
  });

  const formatNumber = (value: number) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getSeverityColor = (excessPercent: number) => {
    if (excessPercent >= 100) return 'text-red-600';
    if (excessPercent >= 50) return 'text-orange-600';
    if (excessPercent >= 25) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีสินค้าเกินคลัง
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 font-medium">สถานะ</th>
            <th
              className="text-left py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('itemName')}
            >
              <div className="flex items-center gap-1">
                สินค้า
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="text-left py-3 px-2 font-medium">สาขา</th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('qtyOnHand')}
            >
              <div className="flex items-center justify-end gap-1">
                คงเหลือ
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('maxStockLevel')}
            >
              <div className="flex items-center justify-end gap-1">
                สูงสุด
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('valueExcess')}
            >
              <div className="flex items-center justify-end gap-1">
                มูลค่าส่วนเกิน
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={`${item.itemCode}-${item.branchName}-${index}`} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-2 px-2">
                <AlertCircle className={`h-4 w-4 ${getSeverityColor(item.excessPercent)}`} />
              </td>
              <td className="py-2 px-2">
                <div className="font-medium">{item.itemName}</div>
                <div className="text-xs text-muted-foreground">
                  {item.brandName} • {item.categoryName}
                </div>
              </td>
              <td className="py-2 px-2 text-xs">{item.branchName}</td>
              <td className="py-2 px-2 text-right">
                {formatNumber(item.qtyOnHand)}
              </td>
              <td className="py-2 px-2 text-right">
                {formatNumber(item.maxStockLevel)}
              </td>
              <td className={`py-2 px-2 text-right font-medium ${getSeverityColor(item.excessPercent)}`}>
                ฿{formatCurrency(item.valueExcess)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
