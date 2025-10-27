# TASK-DASH-009 - Create Empty State Component with CTA

## Context & Goal

**Business Value:** Guide new users to add their first transaction (FR-046, UX-010)  
**Epic:** EPIC-06 Dashboard & Reporting  
**PRD Reference:** FR-046, UX-010 (Empty state)

## Scope Definition

**✅ In Scope:**

- Empty state for dashboard when no transactions
- Empty state for charts
- Friendly message and illustration
- "+ Add Transaction" CTA button
- Reusable EmptyState component (from FOUND-010)

**⛔ Out of Scope:**

- Onboarding tutorial (V1.1)

## Technical Specifications

```typescript
// Usage in dashboard components
import { EmptyState } from '@/components/empty-state';

// In KPICards
if (!data || data.transactionCount === 0) {
  return (
    <EmptyState
      title="No transactions yet"
      description="Add your first transaction to see your financial insights!"
      action={{
        label: '+ Add Transaction',
        onClick: () => {
          /* Open transaction form */
        },
      }}
      icon={<WalletIcon className="h-16 w-16" />}
    />
  );
}

// In CategoryBreakdownChart
if (data.length === 0) {
  return (
    <Card>
      <CardContent className="pt-6">
        <EmptyState
          title="No data for this period"
          description="Try selecting a different date range or add some transactions."
          icon={<PieChartIcon className="h-12 w-12" />}
        />
      </CardContent>
    </Card>
  );
}
```

## Acceptance Criteria

1. **Given** new user with no transactions
   **When** viewing dashboard
   **Then** empty state with CTA shown

2. **Given** empty state CTA clicked
   **When** clicking "+ Add Transaction"
   **Then** transaction form opens

3. **Given** date filter with no data
   **When** viewing charts
   **Then** chart empty state shown

4. **Given** empty state message
   **When** reading
   **Then** friendly, helpful guidance provided

## Definition of Done

- [ ] EmptyState component (from FOUND-010) integrated
- [ ] Dashboard empty state
- [ ] Chart empty states
- [ ] CTA opens transaction form
- [ ] Friendly copy
- [ ] Icons/illustrations

## Dependencies

**Upstream:** TASK-FOUND-010 (EmptyState), TASK-TXN-009 (Add button)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
