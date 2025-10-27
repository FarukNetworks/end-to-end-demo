# TASK-FILT-003 - Create Filters Bar Component

## Context & Goal

**Business Value:** Enable transaction filtering by date, category, account, type (FR-036)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-036 (Filter UI)

## Scope Definition

**✅ In Scope:**

- Filters bar component
- Date range filter
- Category dropdown filter
- Account dropdown filter
- Type filter (expense/income/all)
- Apply filters button
- Clear filters button

**⛔ Out of Scope:**

- Saved filter presets (V1.1)

## Technical Specifications

```typescript
// /components/transactions/filters-bar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CategorySelect } from '@/components/categories/category-select';
import { DateRangePicker } from './date-range-picker';

export function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    categoryId: searchParams.get('categoryId') || '',
    accountId: searchParams.get('accountId') || '',
    type: searchParams.get('type') || 'all',
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    router.push(`/transactions?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      from: '',
      to: '',
      categoryId: '',
      accountId: '',
      type: 'all',
    });
    router.push('/transactions');
  };

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/50 p-4">
      <DateRangePicker
        from={filters.from ? new Date(filters.from) : undefined}
        to={filters.to ? new Date(filters.to) : undefined}
        onChange={(from, to) =>
          setFilters(prev => ({
            ...prev,
            from: from?.toISOString().slice(0, 10) || '',
            to: to?.toISOString().slice(0, 10) || '',
          }))
        }
      />

      <CategorySelect
        value={filters.categoryId}
        onChange={categoryId => setFilters(prev => ({ ...prev, categoryId }))}
        placeholder="All categories"
      />

      <div className="flex gap-2">
        <Button onClick={applyFilters}>Apply</Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** filters selected
   **When** clicking Apply
   **Then** URL updates with filter params

2. **Given** filters applied
   **When** clicking Clear
   **Then** all filters reset and URL cleared

3. **Given** filter change
   **When** applying
   **Then** transaction list updates

## Definition of Done

- [ ] FiltersBar component created
- [ ] All filter inputs
- [ ] Apply filters logic
- [ ] Clear filters logic
- [ ] URL query param updates

## Dependencies

**Upstream:** TASK-CAT-010 (CategorySelect), TASK-DASH-008 (Date filter pattern)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
