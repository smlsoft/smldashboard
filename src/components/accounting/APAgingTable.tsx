'use client';

import { PaginatedTable, type ColumnDef } from '../PaginatedTable';
import type { AgingItem } from '@/lib/data/types';

interface APAgingTableProps {
  data: AgingItem[];
}

export function APAgingTable({ data }: APAgingTableProps) {

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const getAgingColor = (bucket: string): string => {
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

  const columns: ColumnDef<AgingItem>[] = [
    {
      key: 'docNo',
      header: 'เลขที่เอกสาร',
      sortable: false,
      align: 'left',
      render: (item: AgingItem) => (
        <span className="font-mono text-xs">{item.docNo}</span>
      ),
    },
    {
      key: 'name',
      header: 'ซัพพลายเออร์',
      sortable: true,
      align: 'left',
      render: (item: AgingItem) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.code}</div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'วันครบกำหนด',
      sortable: true,
      align: 'right',
      render: (item: AgingItem) => (
        <span className="text-xs">{formatDate(item.dueDate)}</span>
      ),
    },
    {
      key: 'outstanding',
      header: 'ยอดค้างชำระ',
      sortable: true,
      align: 'right',
      render: (item: AgingItem) => (
        <span className="font-medium">฿{formatCurrency(item.outstanding)}</span>
      ),
    },
    {
      key: 'agingBucket',
      header: 'อายุหนี้',
      sortable: true,
      align: 'center',
      render: (item: AgingItem) => (
        <span className={getAgingColor(item.agingBucket)}>
          {item.agingBucket}
        </span>
      ),
    },
  ];

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีเจ้าหนี้ค้างชำระ
      </div>
    );
  }

  return (
    <PaginatedTable
      data={data}
      columns={columns}
      itemsPerPage={10}
      emptyMessage="ไม่มีเจ้าหนี้ค้างชำระ"
      defaultSortKey="daysOverdue"
      defaultSortOrder="desc"
      keyExtractor={(item: AgingItem) => `${item.code}-${item.docNo}`}
    />
  );
}
