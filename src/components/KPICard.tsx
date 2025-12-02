import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    description?: string;
    subtitle?: string;
    className?: string;
}

export function KPICard({ title, value, icon: Icon, trend, trendUp, description, subtitle, className }: KPICardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1",
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="rounded-xl bg-[hsl(var(--primary))/10] p-2.5 text-[hsl(var(--primary))] transition-colors group-hover:bg-[hsl(var(--primary))] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                        trendUp
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                    )}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        <span>{trend}</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                        {value}
                    </span>
                    {subtitle && (
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                            {subtitle}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {description}
                    </p>
                )}
            </div>

            {/* Decorative gradient blob */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-[hsl(var(--primary))/20] to-violet-500/20 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
        </div>
    );
}
