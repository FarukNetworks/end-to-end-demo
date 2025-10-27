# TASK-DASH-010 - Implement Chart Click-Through to Filtered Transactions

## Context & Goal

**Business Value:** Enable exploration from chart to detailed transactions (FR-043)  
**Epic:** EPIC-06 Dashboard & Reporting  
**PRD Reference:** FR-043 (Click chart → filter transactions)

## Scope Definition

**✅ In Scope:**

- Click handler on donut chart segments
- Navigate to /transactions with category filter
- Preserve date range in navigation

**⛔ Out of Scope:**

- Line chart click-through (V1.1)

## Technical Specifications

```typescript
// Update in category-breakdown.tsx
import { useRouter } from 'next/navigation';

export function CategoryBreakdownChart({ from, to }) {
  const router = useRouter();

  const handleSegmentClick = (data: any) => {
    const params = new URLSearchParams({
      categoryId: data.categoryId,
      from,
      to,
    });
    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <PieChart onClick={handleSegmentClick}>
      {/* ... existing chart config ... */}
    </PieChart>
  );
}
```

## Acceptance Criteria

1. **Given** donut chart segment clicked
   **When** clicking "Groceries"
   **Then** navigate to /transactions?categoryId=xxx&from=...&to=...

2. **Given** date range "This Month"
   **When** clicking category
   **Then** transaction list filtered to category + this month

3. **Given** click-through
   **When** viewing transactions page
   **Then** correct transactions shown with filters applied

## Definition of Done

- [ ] Click handler on chart segments
- [ ] Navigate to /transactions with filters
- [ ] Date range preserved
- [ ] Category filter applied

## Dependencies

**Upstream:** TASK-DASH-006 (Donut chart), FILT-008 (URL params)  
**Effort:** 3 SP  
**Priority:** P1 (Should-have)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
