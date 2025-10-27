# TASK-DASH-002 - Implement GET /api/reports/by-category Endpoint

## Context & Goal

**Business Value:** Provide category breakdown data for donut chart (FR-042, US-008)  
**Epic:** EPIC-06 Dashboard & Reporting  
**User Story:** US-DASH-02 - View category breakdown chart  
**PRD Reference:** FR-042 (Category distribution)

## Scope Definition

**✅ In Scope:**

- GET /api/reports/by-category endpoint
- Date range parameters
- Group by category with totals
- Include category name and color
- Calculate percentages
- Filter by type (expense/income)

**⛔ Out of Scope:**

- Top N categories (handled client-side)

## Technical Specifications

```typescript
// /app/api/reports/by-category/route.ts
export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from')
    ? new Date(searchParams.get('from')!)
    : undefined;
  const to = searchParams.get('to')
    ? new Date(searchParams.get('to')!)
    : undefined;
  const type = searchParams.get('type') as 'expense' | 'income' | undefined;

  const result = await db.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId: user.id,
      ...(from && { txnDate: { gte: from } }),
      ...(to && { txnDate: { lte: to } }),
      ...(type && { type }),
    },
    _sum: {
      amount: true,
    },
  });

  const total = result.reduce((sum, r) => sum + Number(r._sum.amount || 0), 0);

  // Fetch category details
  const categoryIds = result.map(r => r.categoryId);
  const categories = await db.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });

  const data = result.map(r => {
    const category = categories.find(c => c.id === r.categoryId);
    const amount = Number(r._sum.amount || 0);
    const percentage = total > 0 ? (amount / total) * 100 : 0;

    return {
      categoryId: r.categoryId,
      categoryName: category?.name || 'Unknown',
      categoryColor: category?.color || '#6b7280',
      total: Number(amount.toFixed(2)),
      percentage: Number(percentage.toFixed(1)),
    };
  });

  // Sort by total descending
  data.sort((a, b) => b.total - a.total);

  return NextResponse.json({ data, total: Number(total.toFixed(2)) });
}
```

## Acceptance Criteria

1. **Given** transactions across categories
   **When** GET /api/reports/by-category
   **Then** return breakdown with totals and percentages

2. **Given** €1000 total, €400 in Groceries
   **When** checking Groceries
   **Then** percentage = 40%

3. **Given** type=expense parameter
   **When** GET
   **Then** only expense categories returned

4. **Given** categories sorted
   **When** checking order
   **Then** sorted by total descending

## Definition of Done

- [ ] GET endpoint implemented
- [ ] Group by categoryId
- [ ] Calculate totals and percentages
- [ ] Include category name and color
- [ ] Type filtering
- [ ] Sorted by total descending
- [ ] Integration tests

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-TXN-002, TASK-CAT-002  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
