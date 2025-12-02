import { cn } from '@/lib/utils';

interface DataCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    description?: string;
}

export function DataCard({ title, children, className, action, description }: DataCardProps) {
    return (
        <div className={cn(
            "flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-all duration-200 hover:shadow-md",
            className
        )}>
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
                <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))] tracking-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
                {action && (
                    <div className="flex items-center gap-2">
                        {action}
                    </div>
                )}
            </div>
            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    );
}
