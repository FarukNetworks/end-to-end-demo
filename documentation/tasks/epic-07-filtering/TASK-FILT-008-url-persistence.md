# TASK-FILT-008 - Implement URL Query Parameter Persistence

## Context & Goal

**Business Value:** Maintain filter state across navigation and page refreshes (FR-036)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-036 (URL query persistence), UX (Filters persisted in URL)

## Scope Definition

**✅ In Scope:**

- URL query parameter management
- Read filters from URL on page load
- Update URL when filters change
- Shareable filter URLs

**⛔ Out of Scope:**

- Browser history management (default Next.js behavior)
- Deep linking validation (V2)

## Technical Specifications

```typescript
// Pattern already used in filters, this task ensures consistency

// In FiltersBar and all filter components
import { useRouter, useSearchParams } from 'next/navigation';

export function FilterComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL
  const initialValue = searchParams.get('filterKey') || defaultValue;

  // Update URL
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Preserve existing params
    router.push(`?${params.toString()}`);
  };

  return (/* ... */);
}

// Server component reads from searchParams
export default function Page({ searchParams }) {
  const filters = {
    from: searchParams.from,
    to: searchParams.to,
    categoryId: searchParams.categoryId,
    accountId: searchParams.accountId,
    type: searchParams.type,
    q: searchParams.q,
  };

  // Use filters for API fetch
}
```

## Acceptance Criteria

1. **Given** filter applied
   **When** checking URL
   **Then** URL contains filter parameters

2. **Given** URL with filters
   **When** page refresh
   **Then** filters restored from URL

3. **Given** URL shared
   **When** another user opens link
   **Then** same filters applied (if authenticated)

4. **Given** filter removed
   **When** clearing
   **Then** parameter removed from URL

## Definition of Done

- [ ] All filters read from URL on load
- [ ] All filters update URL on change
- [ ] URL params preserved when adding new filter
- [ ] Shareable URLs work
- [ ] No duplicate params in URL

## Dependencies

**Upstream:** TASK-FILT-003 (FiltersBar), TASK-FILT-002 (List page)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
