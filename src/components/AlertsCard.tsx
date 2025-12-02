import { AlertTriangle, CheckCircle, Info, XCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
    id: number;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp?: string;
}

interface AlertsCardProps {
    alerts: Alert[];
}

const alertConfig = {
    info: {
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        border: 'border-blue-100 dark:border-blue-500/20'
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-100 dark:border-amber-500/20'
    },
    success: {
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-100 dark:border-emerald-500/20'
    },
    error: {
        icon: XCircle,
        color: 'text-rose-600',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-100 dark:border-rose-500/20'
    },
};

export function AlertsCard({ alerts }: AlertsCardProps) {
    if (alerts.length === 0) {
        return (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                    <Bell className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-[hsl(var(--foreground))]">No notifications</h3>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">Notifications</h3>
                </div>
                <span className="rounded-full bg-[hsl(var(--primary))/10] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">
                    {alerts.length} New
                </span>
            </div>
            <div className="divide-y divide-[hsl(var(--border))]">
                {alerts.map((alert) => {
                    const config = alertConfig[alert.type];
                    const Icon = config.icon;

                    return (
                        <div key={alert.id} className="group flex gap-4 p-4 transition-colors hover:bg-[hsl(var(--muted))/50]">
                            <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", config.bg, config.color)}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{alert.title}</p>
                                    {alert.timestamp && (
                                        <span className="whitespace-nowrap text-xs text-[hsl(var(--muted-foreground))]">
                                            {new Date(alert.timestamp).toLocaleDateString('th-TH', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                                    {alert.message}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))/30] px-6 py-3">
                <button className="text-xs font-medium text-[hsl(var(--primary))] hover:underline">
                    View all notifications
                </button>
            </div>
        </div>
    );
}
