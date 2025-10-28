# TASK-DASH-001 - Implement GET /api/reports/summary Endpoint

## Context & Goal

**Business Value:** Provide KPI data for dashboard (FR-040, US-007)  
**Epic:** EPIC-06 Dashboard & Reporting  
**User Story:** US-DASH-01 - See total spending this month  
**PRD Reference:** FR-040 (Dashboard KPIs)

## Scope Definition

**✅ In Scope:**

- GET /api/reports/summary endpoint
- Date range parameters (from, to)
- Calculate: totalIncome, totalExpense, net, transactionCount
- User scoping

**⛔ Out of Scope:**

- Budget progress (EPIC-08)
- Comparison to previous period (V1.1)

## Technical Specifications

```typescript
// /app/api/reports/summary/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      ...(from && { txnDate: { gte: from } }),
      ...(to && { txnDate: { lte: to } }),
    },
    select: {
      amount: true,
      type: true,
    },
  });

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const net = totalIncome - totalExpense;

  return NextResponse.json({
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    net: Number(net.toFixed(2)),
    transactionCount: transactions.length,
  });
}
```

## Acceptance Criteria

1. **Given** user with transactions
   **When** GET /api/reports/summary?from=2025-10-01&to=2025-10-31
   **Then** return totals for October 2025

2. **Given** 3 income (€1000 each), 5 expense (€200 each)
   **When** calculating summary
   **Then** totalIncome=€3000, totalExpense=€1000, net=€2000

3. **Given** no date parameters
   **When** GET /api/reports/summary
   **Then** return all-time totals

4. **Given** decimal precision
   **When** checking response
   **Then** all values have max 2 decimal places

## Definition of Done

- [x] GET endpoint implemented
- [x] Date range filtering
- [x] Calculate totalIncome, totalExpense, net, count
- [x] Decimal precision (2 places)
- [x] User scoping
- [x] Integration tests with various scenarios

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-TXN-002  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
