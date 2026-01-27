import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ReportOption<T extends string = string> {
    value: T;
    label: string;
    icon: LucideIcon;
    description: string;
}

interface ReportTypeSelectorProps<T extends string> {
    value: T;
    options: ReportOption<T>[];
    onChange: (value: T) => void;
    label?: string;
    className?: string;
}

export function ReportTypeSelector<T extends string>({
    value,
    options,
    onChange,
    label = 'ประเภทรายงาน:',
    className = '',
}: ReportTypeSelectorProps<T>) {
    const currentReport = options.find((opt) => opt.value === value);

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}>
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {label}
            </label>
            <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 sm:flex-initial">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value as T)}
                        className="w-full sm:w-auto sm:min-w-[280px] pl-10 pr-10 py-2 bg-background border rounded-lg appearance-none cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {currentReport && (
                        <currentReport.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
