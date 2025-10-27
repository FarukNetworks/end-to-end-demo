# TASK-EXP-004 - Implement Filtered CSV Export

## Context & Goal

**Business Value:** Enable exporting specific date ranges for tax/accounting (FR-052)  
**Epic:** EPIC-09 Data Export (Stretch - V1.1)  
**PRD Reference:** FR-052 (Export filtered transactions)

## Scope Definition

**✅ In Scope:**

- Pass date range to export endpoint
- Export button on filtered transaction list
- Filename includes date range
- Preserve all active filters in export

**⛔ Out of Scope:**

- Export selected transactions only (V2)

## Technical Specifications

```typescript
// Add to FiltersBar component
import { Download } from 'lucide-react';

export function FiltersBar() {
  // ... existing filter logic

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.accountId) params.set('accountId', filters.accountId);
    if (filters.type && filters.type !== 'all')
      params.set('type', filters.type);

    const response = await fetch(
      `/api/transactions/export.csv?${params.toString()}`
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const dateRange =
        filters.from && filters.to
          ? `${filters.from}_${filters.to}`
          : new Date().toISOString().slice(0, 10);
      a.download = `budgetbuddy-export-${dateRange}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Transactions exported!');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Existing filters */}
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
```

```typescript
// Update export endpoint to accept filters
// /app/api/transactions/export.csv/route.ts
export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);

  // Parse all filter parameters (same as FILT-001)
  const filters = {
    from: searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : undefined,
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    accountId: searchParams.get('accountId') || undefined,
    type: searchParams.get('type') as 'expense' | 'income' | undefined,
  };

  const { transactions } = await getTransactions(user.id, filters);

  const csv = transactionsToCSV(transactions);

  // ... rest of CSV response
}
```

## Acceptance Criteria

1. **Given** filtered transaction list
   **When** clicking Export button
   **Then** CSV contains only filtered transactions

2. **Given** date range filter active
   **When** exporting
   **Then** filename includes date range

3. **Given** category filter active
   **When** exporting
   **Then** only that category's transactions exported

4. **Given** no filters active
   **When** exporting
   **Then** all transactions exported

## Definition of Done

- [ ] Export button in FiltersBar
- [ ] Export endpoint accepts filter params
- [ ] Filename includes date range
- [ ] All filters supported in export
- [ ] Integration test for filtered export

## Dependencies

**Upstream:** TASK-EXP-001, TASK-EXP-002, TASK-FILT-003  
**Effort:** 4 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Frontend/Backend Engineers)
