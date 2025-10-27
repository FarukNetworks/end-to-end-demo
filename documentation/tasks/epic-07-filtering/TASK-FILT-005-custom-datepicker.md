# TASK-FILT-005 - Create Custom Date Picker for Date Range

## Context & Goal

**Business Value:** Enable manual date range selection (FR-038, UX-006)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-038 (Custom date picker), UX-006 (Date picker with presets)

## Scope Definition

**✅ In Scope:**

- Date range picker component
- From and To date inputs
- Calendar popover
- Date validation (from ≤ to)
- Quick presets within picker

**⛔ Out of Scope:**

- Time selection (dates only)

## Technical Specifications

```typescript
// /components/ui/date-picker.tsx (if not already created)
'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({
  date,
  onDateChange,
  presets,
  placeholder = 'Pick a date',
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {presets && (
          <div className="flex gap-2 border-b p-3">
            {presets.map(preset => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = getPresetDate(preset);
                  onDateChange(date);
                }}
              >
                {preset}
              </Button>
            ))}
          </div>
        )}
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function getPresetDate(preset: string): Date {
  const now = new Date();
  switch (preset) {
    case 'today':
      return now;
    case 'yesterday':
      return new Date(now.setDate(now.getDate() - 1));
    case '2-days-ago':
      return new Date(now.setDate(now.getDate() - 2));
    default:
      return now;
  }
}
```

## Acceptance Criteria

1. **Given** date picker opened
   **When** viewing calendar
   **Then** current month shown

2. **Given** date selected
   **When** clicking date
   **Then** picker closes and date set

3. **Given** preset button "Today"
   **When** clicking
   **Then** today's date selected

4. **Given** from > to
   **When** validating
   **Then** error shown or to date adjusted

## Definition of Done

- [ ] DatePicker component created
- [ ] Calendar popover
- [ ] Preset buttons (Today, Yesterday, 2 Days Ago)
- [ ] Date formatting (DD.MM.YYYY)
- [ ] Accessible

## Dependencies

**Upstream:** TASK-FOUND-002 (Calendar, Popover components)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
