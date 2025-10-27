# TASK-BUDG-003 - Implement GET /api/budgets/progress Endpoint

## Context & Goal

**Business Value:** Calculate budget progress and status (FR-050)  
**Epic:** EPIC-08 Budgets (Stretch - V1.1)  
**PRD Reference:** FR-050 (Budget status: OK/Warn/Over)

## Scope Definition

**✅ In Scope:**

- GET /api/budgets/progress endpoint
- Calculate spent amount from transactions
- Calculate remaining (target - spent)
- Calculate status (OK/Warn/Over per PRD rules)
- Year and month parameters

**⛔ Out of Scope:**

- Budget alerts/notifications (V2)

## Technical Specifications

```typescript
// /app/api/budgets/progress/route.ts
export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString()
  );
  const month = parseInt(
    searchParams.get('month') || (new Date().getMonth() + 1).toString()
  );

  const budgets = await db.budget.findMany({
    where: { userId: user.id, year, month },
    include: { category: { select: { name: true, color: true } } },
  });

  const progress = await Promise.all(
    budgets.map(async budget => {
      // Calculate spent for this category in this month
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      const transactions = await db.transaction.findMany({
        where: {
          userId: user.id,
          categoryId: budget.categoryId,
          type: 'expense', // Budgets only for expenses
          txnDate: { gte: monthStart, lte: monthEnd },
        },
        select: { amount: true },
      });

      const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const target = Number(budget.targetAmount);
      const remaining = target - spent;
      const percentage = target > 0 ? (spent / target) * 100 : 0;

      // Status per PRD: <80% OK, 80-100% Warn, >100% Over
      let status: 'OK' | 'Warn' | 'Over';
      if (spent < target * 0.8) {
        status = 'OK';
      } else if (spent <= target) {
        status = 'Warn';
      } else {
        status = 'Over';
      }

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.category.name,
        categoryColor: budget.category.color,
        target: Number(target.toFixed(2)),
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
        status,
      };
    })
  );

  return NextResponse.json({ data: progress });
}
```

## Acceptance Criteria

1. **Given** budget €500, spent €300
   **When** GET /api/budgets/progress
   **Then** status='OK', remaining=€200, percentage=60%

2. **Given** budget €500, spent €450
   **When** calculating
   **Then** status='Warn' (90% of target)

3. **Given** budget €500, spent €550
   **When** calculating
   **Then** status='Over', remaining=-€50

4. **Given** no transactions
   **When** calculating
   **Then** spent=0, remaining=target, status='OK'

## Definition of Done

- [ ] GET endpoint implemented
- [ ] Spent calculation correct
- [ ] Status calculation per PRD rules (80% thresholds)
- [ ] Percentage calculation
- [ ] Integration tests for all status scenarios

## Dependencies

**Upstream:** TASK-BUDG-001, TASK-TXN-002  
**Effort:** 5 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Backend Engineer)
