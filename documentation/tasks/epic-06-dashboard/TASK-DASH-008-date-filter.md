# TASK-DASH-008 - Implement Date Range Filter Component

## Context & Goal

**Business Value:** Enable users to view data for different time periods (FR-041)  
**Epic:** EPIC-06 Dashboard & Reporting  
**PRD Reference:** FR-041 (Date range filter), FR-037 (Presets)

## Scope Definition

**✅ In Scope:**

- Date range filter component
- Presets: This Month, Last Month, This Year, Custom
- Custom date picker for from/to
- URL query parameter updates
- Persist filter across navigation

**⛔ Out of Scope:**

- Saved filter presets (V1.1)

## Technical Specifications

```typescript
// /components/dashboard/date-range-filter.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

const presets = {
  'this-month': {
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: now,
      };
    },
  },
  'last-month': {
    label: 'Last Month',
    getRange: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    },
  },
  'this-year': {
    label: 'This Year',
    getRange: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), 0, 1),
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
  const [customRange, setCustomRange] = useState({ from: null, to: null });

  const applyFilter = (from?: Date, to?: Date) => {
    const params = new URLSearchParams(searchParams);
    if (from) params.set('from', from.toISOString().slice(0, 10));
    if (to) params.set('to', to.toISOString().slice(0, 10));
    router.push(`?${params.toString()}`);
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom') {
      const range = presets[value].getRange();
      applyFilter(range.from, range.to);
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          {presets[preset].label}
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
            onDateChange={from => {
              setCustomRange(prev => ({ ...prev, from }));
              if (from && customRange.to) applyFilter(from, customRange.to);
            }}
            placeholder="From"
          />
          <DatePicker
            date={customRange.to}
            onDateChange={to => {
              setCustomRange(prev => ({ ...prev, to }));
              if (customRange.from && to) applyFilter(customRange.from, to);
            }}
            placeholder="To"
          />
        </>
      )}
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** "This Month" selected
   **When** applying
   **Then** URL updates with from/to for current month

2. **Given** "Custom" selected
   **When** selecting dates
   **Then** custom date pickers appear

3. **Given** filter applied
   **When** navigating away and back
   **Then** filter persists (URL params)

## Definition of Done

- [ ] DateRangeFilter component created
- [ ] Presets implemented
- [ ] Custom date range
- [ ] URL query param updates
- [ ] Filter persistence

## Dependencies

**Upstream:** TASK-FOUND-002 (Select), Custom DatePicker component  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
