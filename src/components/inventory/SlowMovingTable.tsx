'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { SlowMovingItem } from '@/lib/data/types';

interface SlowMovingTableProps {
  data: SlowMovingItem[];
}

type SortField = 'itemName' | 'inventoryValue' | 'qtySold' | 'daysOfStock';
type SortOrder = 'asc' | 'desc';

export function SlowMovingTable({ data }: SlowMovingTableProps) {
  const [sortField, setSortField] = useState<SortField>('inventoryValue');
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
      case 'inventoryValue':
        aVal = a.inventoryValue;
        bVal = b.inventoryValue;
        break;
      case 'qtySold':
        aVal = a.qtySold;
        bVal = b.qtySold;
        break;
      case 'daysOfStock':
        aVal = a.daysOfStock;
        bVal = b.daysOfStock;
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

  const getStockDaysColor = (days: number) => {
    if (days >= 365) return 'text-red-600';
    if (days >= 180) return 'text-orange-600';
    if (days >= 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีสินค้าหมุนเวียนช้า
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
            <th className="text-right py-3 px-2 font-medium">คงเหลือ</th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('qtySold')}
            >
              <div className="flex items-center justify-end gap-1">
                ขายได้
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('inventoryValue')}
            >
              <div className="flex items-center justify-end gap-1">
                มูลค่าคงคลัง
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('daysOfStock')}
            >
              <div className="flex items-center justify-end gap-1">
                วันคงคลัง
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={`${item.itemCode}-${index}`} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
              <td className="py-2 px-2">
                <div className="font-medium">{item.itemName}</div>
                <div className="text-xs text-muted-foreground">
                  {item.brandName} • {item.categoryName}
                </div>
              </td>
              <td className="py-2 px-2 text-right">
                {formatNumber(item.qtyOnHand)}
              </td>
              <td className="py-2 px-2 text-right">
                {formatNumber(item.qtySold)}
              </td>
              <td className="py-2 px-2 text-right font-medium">
                ฿{formatCurrency(item.inventoryValue)}
              </td>
              <td className={`py-2 px-2 text-right ${getStockDaysColor(item.daysOfStock)}`}>
                {item.daysOfStock >= 999 ? '∞' : formatNumber(Math.round(item.daysOfStock))} วัน
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
