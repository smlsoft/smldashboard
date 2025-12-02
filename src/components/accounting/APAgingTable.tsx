'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgingItem } from '@/lib/data/types';

interface APAgingTableProps {
  data: AgingItem[];
}

type SortField = 'name' | 'outstanding' | 'daysOverdue';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function APAgingTable({ data }: APAgingTableProps) {
  const [sortField, setSortField] = useState<SortField>('daysOverdue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

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
      case 'name':
        aVal = a.name;
        bVal = b.name;
        break;
      case 'outstanding':
        aVal = a.outstanding;
        bVal = b.outstanding;
        break;
      case 'daysOverdue':
        aVal = a.daysOverdue;
        bVal = b.daysOverdue;
        break;
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const getAgingColor = (bucket: string) => {
    switch (bucket) {
      case 'ยังไม่ครบกำหนด':
        return 'text-green-600';
      case '1-30 วัน':
        return 'text-yellow-600';
      case '31-60 วัน':
        return 'text-orange-600';
      case '61-90 วัน':
        return 'text-red-600';
      default:
        return 'text-red-700 font-semibold';
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีเจ้าหนี้ค้างชำระ
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 font-medium">เลขที่เอกสาร</th>
            <th
              className="text-left py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                ซัพพลายเออร์
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="text-right py-3 px-2 font-medium">วันครบกำหนด</th>
            <th
              className="text-right py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('outstanding')}
            >
              <div className="flex items-center justify-end gap-1">
                ยอดค้างชำระ
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th
              className="text-center py-3 px-2 font-medium cursor-pointer hover:text-primary"
              onClick={() => handleSort('daysOverdue')}
            >
              <div className="flex items-center justify-center gap-1">
                อายุหนี้
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-2 px-2 font-mono text-xs">{item.docNo}</td>
              <td className="py-2 px-2">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.code}</div>
              </td>
              <td className="py-2 px-2 text-right text-xs">
                {formatDate(item.dueDate)}
              </td>
              <td className="py-2 px-2 text-right font-medium">
                ฿{formatCurrency(item.outstanding)}
              </td>
              <td className={`py-2 px-2 text-center ${getAgingColor(item.agingBucket)}`}>
                {item.agingBucket}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            แสดง {startIndex + 1}-{Math.min(endIndex, sortedData.length)} จาก {sortedData.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
