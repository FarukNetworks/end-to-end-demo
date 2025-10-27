# TASK-DASH-003 - Implement GET /api/reports/cashflow Endpoint

## Context & Goal

**Business Value:** Provide monthly cash-flow data for line chart (FR-044, US-009)  
**Epic:** EPIC-06 Dashboard & Reporting  
**User Story:** US-DASH-03 - See monthly cash-flow over time  
**PRD Reference:** FR-044 (Cash-flow line chart)

## Scope Definition

**✅ In Scope:**

- GET /api/reports/cashflow endpoint
- Parameters: start (YYYY-MM), months (default 6)
- Calculate income, expense, net per month
- Return array of monthly data points

**⛔ Out of Scope:**

- Weekly cash-flow (V1.1)
- Forecasting (V2)

## Technical Specifications

```typescript
// /app/api/reports/cashflow/route.ts
export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get('start'); // YYYY-MM
  const months = parseInt(searchParams.get('months') || '6');

  const start = startParam
    ? new Date(startParam)
    : new Date(new Date().getFullYear(), new Date().getMonth() - months + 1, 1);

  const data = [];

  for (let i = 0; i < months; i++) {
    const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const monthEnd = new Date(
      start.getFullYear(),
      start.getMonth() + i + 1,
      0,
      23,
      59,
      59
    );

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        txnDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: { amount: true, type: true },
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    data.push({
      month: monthStart.toISOString().slice(0, 7), // YYYY-MM
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      net: Number((income - expense).toFixed(2)),
    });
  }

  return NextResponse.json({ data });
}
```

## Acceptance Criteria

1. **Given** start=2025-06, months=6
   **When** GET /api/reports/cashflow
   **Then** return 6 months of data (June to November)

2. **Given** month with €2000 income, €1500 expense
   **When** checking data point
   **Then** net = €500

3. **Given** no transactions in month
   **When** checking data point
   **Then** income=0, expense=0, net=0

4. **Given** default parameters
   **When** GET without params
   **Then** return last 6 months

## Definition of Done

- [ ] GET endpoint implemented
- [ ] Month range calculation
- [ ] Income/expense/net per month
- [ ] Default to 6 months
- [ ] User scoping
- [ ] Integration tests

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-TXN-002  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
