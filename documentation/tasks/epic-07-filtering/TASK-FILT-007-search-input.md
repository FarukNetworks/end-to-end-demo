# TASK-FILT-007 - Create Search Input with Debounce

## Context & Goal

**Business Value:** Enable searching transactions by note text (FR-039)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-039 (Search by note)

## Scope Definition

**✅ In Scope:**

- Search input in filters bar
- Debounce (300ms) to avoid excessive API calls
- Search by note field (case-insensitive)
- Clear search button

**⛔ Out of Scope:**

- Advanced search (tags, amount) - V1.1
- Search highlighting (V1.1)

## Technical Specifications

```typescript
// /components/transactions/search-input.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      params.set('q', debouncedSearch);
    } else {
      params.delete('q');
    }

    router.push(`/transactions?${params.toString()}`);
  }, [debouncedSearch]);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search transactions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="pl-9 pr-9"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
```

```typescript
// /hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Acceptance Criteria

1. **Given** typing in search
   **When** user types "grocery"
   **Then** wait 300ms before updating URL

2. **Given** search query in URL
   **When** loading page
   **Then** search input pre-filled with query

3. **Given** search active
   **When** clicking X button
   **Then** search cleared

4. **Given** debounced search
   **When** checking API calls
   **Then** only 1 call after typing stops (not per keystroke)

## Definition of Done

- [ ] SearchInput component created
- [ ] Debounce hook implemented (300ms)
- [ ] Search icon
- [ ] Clear button (X)
- [ ] URL query param updates
- [ ] Pre-fill from URL

## Dependencies

**Upstream:** TASK-FILT-001 (q parameter support)  
**Effort:** 3 SP  
**Priority:** P1 (Should-have)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
