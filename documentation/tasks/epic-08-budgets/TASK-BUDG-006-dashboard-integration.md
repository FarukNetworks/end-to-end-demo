# TASK-BUDG-006 - Add Budget Progress Indicators to Dashboard

## Context & Goal

**Business Value:** Show budget status on dashboard for quick visibility  
**Epic:** EPIC-08 Budgets (Stretch - V1.1)  
**PRD Reference:** Integration of budgets with dashboard

## Scope Definition

**✅ In Scope:**

- Budget progress cards on dashboard
- Display for current month budgets
- Progress bars with status colors
- Link to /budgets page

**⛔ Out of Scope:**

- Historical budget tracking (V2)

## Technical Specifications

```typescript
// /components/dashboard/budget-progress.tsx
export function BudgetProgress() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const now = new Date();
    fetch(
      `/api/budgets/progress?year=${now.getFullYear()}&month=${
        now.getMonth() + 1
      }`
    )
      .then(res => res.json())
      .then(data => setBudgets(data.data));
  }, []);

  if (budgets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map(budget => (
          <div key={budget.budgetId}>
            <div className="flex justify-between mb-2">
              <span>{budget.categoryName}</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(budget.spent)} / {formatCurrency(budget.target)}
              </span>
            </div>
            <Progress
              value={budget.percentage}
              className={
                budget.status === 'OK'
                  ? 'bg-green-500'
                  : budget.status === 'Warn'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Acceptance Criteria

1. **Given** budgets exist for current month
   **When** viewing dashboard
   **Then** budget progress card shown

2. **Given** budget status OK
   **When** viewing
   **Then** progress bar green

3. **Given** budget status Over
   **When** viewing
   **Then** progress bar red

## Definition of Done

- [ ] BudgetProgress component created
- [ ] Fetch from progress endpoint
- [ ] Progress bars
- [ ] Status color coding
- [ ] Integration in dashboard

## Dependencies

**Upstream:** TASK-BUDG-003, TASK-DASH-004  
**Effort:** 4 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
