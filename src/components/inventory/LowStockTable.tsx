'use client';

import { useState } from 'react';
import { ArrowUpDown, AlertTriangle } from 'lucide-react';
import type { LowStockItem } from '@/lib/data/types';

interface LowStockTableProps {
  data: LowStockItem[];
}

type SortField = 'itemName' | 'qtyOnHand' | 'reorderPoint' | 'shortage';
type SortOrder = 'asc' | 'desc';

export function LowStockTable({ data }: LowStockTableProps) {
  const [sortField, setSortField] = useState<SortField>('shortage');
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
    shortage: item.reorderPoint - item.qtyOnHand,
    shortagePercent: ((item.reorderPoint - item.qtyOnHand) / item.reorderPoint) * 100,
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
      case 'reorderPoint':
        aVal = a.reorderPoint;
        bVal = b.reorderPoint;
        break;
      case 'shortage':
        aVal = a.shortage;
        bVal = b.shortage;
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

  const getUrgencyColor = (shortagePercent: number) => {
    if (shortagePercent >= 75) return 'text-red-600';
    if (shortagePercent >= 50) return 'text-orange-600';
    if (shortagePercent >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีสินค้าใกล้หมด
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
              onClick={() => handleSort('reorderPoint')}
            >
              <div className="flex items-center justify-end gap-1">
                จุด Reorder
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('shortage')}
            >
              <div className="flex items-center justify-end gap-1">
                ขาด
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={`${item.itemCode}-${item.branchName}-${index}`} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-2 px-2">
                <AlertTriangle className={`h-4 w-4 ${getUrgencyColor(item.shortagePercent)}`} />
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
                {formatNumber(item.reorderPoint)}
              </td>
              <td className={`py-2 px-2 text-right font-medium ${getUrgencyColor(item.shortagePercent)}`}>
                {formatNumber(item.shortage)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
