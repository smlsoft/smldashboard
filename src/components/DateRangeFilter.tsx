'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { DATE_RANGES, type DateRangeKey } from '@/lib/dateRanges';
import type { DateRange } from '@/lib/data/types';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  defaultKey?: DateRangeKey;
  className?: string;
}

export function DateRangeFilter({ value, onChange, defaultKey = 'THIS_MONTH', className = '' }: DateRangeFilterProps) {
  const [selectedKey, setSelectedKey] = useState<DateRangeKey>(defaultKey);
  const [showCustom, setShowCustom] = useState(false);
  
  // เมื่อ component mount ให้ trigger onChange ด้วย preset ที่เลือก เพื่อให้ค่าตรงกัน
  useEffect(() => {
    if (selectedKey !== 'CUSTOM') {
      const range = DATE_RANGES[selectedKey].getValue();
      onChange(range);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ทำงานครั้งเดียวตอน mount

  const handlePresetChange = (key: DateRangeKey) => {
    setSelectedKey(key);

    if (key === 'CUSTOM') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      const range = DATE_RANGES[key].getValue();
      onChange(range);
    }
  };

  const handleCustomStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      start: e.target.value,
      end: value.end,
    });
  };

  const handleCustomEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      start: value.start,
      end: e.target.value,
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <select
          value={selectedKey}
          onChange={(e) => handlePresetChange(e.target.value as DateRangeKey)}
          className="bg-transparent text-sm font-medium outline-none cursor-pointer"
        >
          {Object.entries(DATE_RANGES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.start}
            onChange={handleCustomStartChange}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">ถึง</span>
          <input
            type="date"
            value={value.end}
            onChange={handleCustomEndChange}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
}
