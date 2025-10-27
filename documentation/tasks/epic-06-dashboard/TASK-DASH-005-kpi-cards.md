# TASK-DASH-005 - Create KPI Cards Component (Income, Expense, Net, Count)

## Context & Goal

**Business Value:** Display key financial metrics at-a-glance (FR-040, US-007)  
**Epic:** EPIC-06 Dashboard & Reporting  
**User Story:** US-DASH-01 - See total spending this month  
**PRD Reference:** FR-040 (KPI cards)

## Scope Definition

**✅ In Scope:**

- KPI card component
- 4 cards: Total Income, Total Expense, Net, Transaction Count
- Fetch from /api/reports/summary
- EUR currency formatting
- Loading skeletons

**⛔ Out of Scope:**

- Comparison to previous period (V1.1)
- Trend indicators (V1.1)

## Technical Specifications

```typescript
// /components/dashboard/kpi-cards.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/chart-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardsProps {
  from: string;
  to: string;
}

export function KPICards({ from, to }: KPICardsProps) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/summary?from=${from}&to=${to}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [from, to]);

  if (isLoading) {
    return <KPICardsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data?.totalIncome || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data?.totalExpense || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (data?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(data?.net || 0)}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.transactionCount || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** dashboard with data
   **When** rendering KPI cards
   **Then** 4 cards display with correct values

2. **Given** positive net
   **When** viewing net card
   **Then** value displayed in green

3. **Given** negative net
   **When** viewing net card
   **Then** value displayed in red

4. **Given** loading state
   **When** fetching data
   **Then** skeleton loaders shown

## Definition of Done

- [ ] KPICards component created
- [ ] 4 cards implemented
- [ ] Fetch from summary endpoint
- [ ] Currency formatting
- [ ] Color coding (green/red)
- [ ] Loading skeletons
- [ ] Responsive grid

## Dependencies

**Upstream:** TASK-DASH-001 (Summary endpoint), TASK-FOUND-002 (Card)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
