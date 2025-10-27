# TASK-DASH-004 - Build Dashboard Page Layout with KPI Cards

## Context & Goal

**Business Value:** Provide main overview page with financial summary (FR-040, UX-014)  
**Epic:** EPIC-06 Dashboard & Reporting  
**PRD Reference:** FR-040, UX-014 (Responsive layout)

## Scope Definition

**✅ In Scope:**

- Dashboard page at / (root)
- KPI cards layout (3-column desktop, 1-column mobile)
- Date range filter integration
- Charts integration
- Responsive breakpoints

**⛔ Out of Scope:**

- Budget indicators (EPIC-08)

## Technical Specifications

```typescript
// /app/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown';
import { CashFlowChart } from '@/components/dashboard/cashflow-chart';
import { DateRangeFilter } from '@/components/dashboard/date-range-filter';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const user = await requireAuth();

  // Default to "This Month"
  const from =
    searchParams.from ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  const to = searchParams.to || new Date().toISOString().slice(0, 10);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DateRangeFilter />
      </div>

      <KPICards from={from} to={to} />

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryBreakdownChart from={from} to={to} />
        <CashFlowChart />
      </div>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** dashboard page
   **When** loading
   **Then** KPI cards, charts, and filters displayed

2. **Given** desktop viewport
   **When** viewing KPIs
   **Then** 3-column layout

3. **Given** mobile viewport
   **When** viewing KPIs
   **Then** single-column stack

4. **Given** date filter changed
   **When** applying
   **Then** KPIs and charts update

## Definition of Done

- [ ] Dashboard page created at /
- [ ] KPI cards integration
- [ ] Charts integration
- [ ] Date filter integration
- [ ] Responsive layout (3-col → 1-col)
- [ ] Loading states
- [ ] Empty state when no data

## Dependencies

**Upstream:** TASK-DASH-005, DASH-006, DASH-007, DASH-008  
**Effort:** 6 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
