'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown
} from 'lucide-react';

interface CustomersTableProps {
    data: any[];
    currentPage: number;
    totalPages: number;
}

export function CustomersTable({ data, currentPage, totalPages }: CustomersTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]"
                    />
                </form>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium shadow-sm hover:bg-[hsl(var(--accent))] transition-colors">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                            <tr>
                                <th className="px-6 py-4 font-medium">Customer Code</th>
                                <th className="px-6 py-4 font-medium">Customer Name</th>
                                <th className="px-6 py-4 font-medium text-right">Total Orders</th>
                                <th className="px-6 py-4 font-medium text-right">Total Spent</th>
                                <th className="px-6 py-4 font-medium">Last Order</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {data.map((item) => (
                                <tr key={item.cust_code} className="group hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[hsl(var(--foreground))]">
                                        {item.cust_code}
                                    </td>
                                    <td className="px-6 py-4 text-[hsl(var(--foreground))]">
                                        {item.cust_name}
                                    </td>
                                    <td className="px-6 py-4 text-right text-[hsl(var(--foreground))]">
                                        {item.total_orders.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-[hsl(var(--primary))]">
                                        ฿{item.total_spent.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                                        {new Date(item.last_order_date).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-6 py-4">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        Page <span className="font-medium text-[hsl(var(--foreground))]">{currentPage}</span> of{' '}
                        <span className="font-medium text-[hsl(var(--foreground))]">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="inline-flex items-center justify-center rounded-lg border border-[hsl(var(--border))] p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))] transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="inline-flex items-center justify-center rounded-lg border border-[hsl(var(--border))] p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))] transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
