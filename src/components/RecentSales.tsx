interface Sale {
    docNo: string;
    docDate: string;
    customerName: string;
    totalAmount: number;
    statusPayment: string;
}

interface RecentSalesProps {
    sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
    if (!sales || sales.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
                ไม่พบรายการขายล่าสุด
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {sales.map((sale) => {
                const initials = sale.customerName ? sale.customerName.substring(0, 2).toUpperCase() : 'XX';

                return (
                    <div key={sale.docNo} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--primary))/10] items-center justify-center text-sm font-bold text-[hsl(var(--primary))]">
                                {initials}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                                    {sale.customerName || 'ไม่ระบุ'}
                                </p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                    {sale.docNo} • {new Date(sale.docDate).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="font-medium text-[hsl(var(--foreground))]">
                            ฿{sale.totalAmount.toLocaleString()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
