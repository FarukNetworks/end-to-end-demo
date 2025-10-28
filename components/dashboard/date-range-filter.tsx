'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

const presets = {
  'this-month': {
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      return {
        from: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
        to: now,
      };
    },
  },
  'last-month': {
    label: 'Last Month',
    getRange: () => {
      const now = new Date();
      return {
        from: new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)),
        to: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
  'this-year': {
    label: 'This Year',
    getRange: () => {
      const now = new Date();
      return {
        from: new Date(Date.UTC(now.getFullYear(), 0, 1)),
        to: now,
      };
    },
  },
  custom: {
    label: 'Custom',
    getRange: () => ({ from: undefined, to: undefined }),
  },
};

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preset, setPreset] = useState('this-month');
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const applyFilter = (from?: Date, to?: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set('from', from.toISOString().slice(0, 10));
    if (to) params.set('to', to.toISOString().slice(0, 10));
    router.push(`?${params.toString()}`);
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom') {
      const range = presets[value as keyof typeof presets].getRange();
      applyFilter(range.from, range.to);
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>{presets[preset as keyof typeof presets].label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(presets).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <>
          <DatePicker
            date={customRange.from}
            onDateChange={(from) => {
              setCustomRange((prev) => ({ ...prev, from }));
              if (from && customRange.to) applyFilter(from, customRange.to);
            }}
            placeholder="From"
          />
          <DatePicker
            date={customRange.to}
            onDateChange={(to) => {
              setCustomRange((prev) => ({ ...prev, to }));
              if (customRange.from && to) applyFilter(customRange.from, to);
            }}
            placeholder="To"
          />
        </>
      )}
    </div>
  );
}
