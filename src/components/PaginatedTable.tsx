'use client';

import { useState, ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  itemsPerPage?: number;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string;
  rowClassName?: (item: T, index: number) => string;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function PaginatedTable<T = any>({
  data,
  columns,
  itemsPerPage = 10,
  emptyMessage = 'ไม่มีข้อมูล',
  keyExtractor = (_, index) => `row-${index}`,
  rowClassName,
  defaultSortKey,
  defaultSortOrder = 'desc',
}: PaginatedTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);

  // Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort data
  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = (a as any)[sortKey];
        const bVal = (b as any)[sortKey];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'th-TH')
            : bVal.localeCompare(aVal, 'th-TH');
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Date comparison
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortOrder === 'asc' 
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        // String comparison for other types
        return sortOrder === 'asc'
          ? String(aVal).localeCompare(String(bVal), 'th-TH')
          : String(bVal).localeCompare(String(aVal), 'th-TH');
      })
    : data;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Get page numbers to display (max 5 pages)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxPages - 1);
      
      if (end - start < maxPages - 1) {
        start = Math.max(1, end - maxPages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Get text alignment class
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  // Get sort icon based on current state
  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-30 group-hover:opacity-60 transition-opacity" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="w-14 h-14 mb-3 rounded-full bg-muted/50 flex items-center justify-center">
          <svg className="w-7 h-7 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full flex-1 min-h-0">
      <div className="overflow-auto flex-1 min-h-0 rounded-none border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-3 px-3 font-semibold text-muted-foreground ${getAlignClass(column.align)} ${
                    column.sortable 
                      ? 'cursor-pointer select-none group hover:text-foreground hover:bg-muted/50 transition-colors' 
                      : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={`flex items-center gap-1.5 ${
                    column.align === 'center' ? 'justify-center' : 
                    column.align === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedData.map((item, index) => (
              <tr
                key={keyExtractor(item, startIndex + index)}
                className={`hover:bg-muted/30 transition-colors ${
                  rowClassName ? rowClassName(item, startIndex + index) : ''
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-2.5 px-3 ${getAlignClass(column.align)} ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(item, startIndex + index)
                      : String((item as any)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 px-1 border-t border-border flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            แสดง <span className="font-medium text-foreground">{startIndex + 1}-{Math.min(endIndex, sortedData.length)}</span> จาก <span className="font-medium text-foreground">{sortedData.length}</span> รายการ
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="หน้าก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center">
              {currentPage > 3 && totalPages > 5 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="min-w-[32px] h-8 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-1 text-muted-foreground text-xs">•••</span>}
                </>
              )}
              
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < totalPages - 2 && totalPages > 5 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-1 text-muted-foreground text-xs">•••</span>}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="min-w-[32px] h-8 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="หน้าถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
