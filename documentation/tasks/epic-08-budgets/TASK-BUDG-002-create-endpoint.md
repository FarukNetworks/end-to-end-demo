# TASK-BUDG-002 - Implement POST /api/budgets Endpoint

## Context & Goal

**Business Value:** Enable users to create monthly budgets (FR-049)  
**Epic:** EPIC-08 Budgets (Stretch - V1.1)  
**PRD Reference:** FR-049 (Create budget with uniqueness validation)

## Scope Definition

**✅ In Scope:**

- POST /api/budgets endpoint
- Validate uniqueness (userId, categoryId, year, month)
- Category ownership validation
- Positive target amount validation
- 409 for duplicate budget

**⛔ Out of Scope:**

- Budget templates (V2)

## Technical Specifications

```typescript
// /app/api/budgets/route.ts
export async function POST(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const { categoryId, year, month, targetAmount } =
    createBudgetSchema.parse(body);

  // Verify category ownership
  const category = await db.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });

  if (!category) {
    return NextResponse.json(
      { error: { code: 'INVALID_CATEGORY', message: 'Category not found' } },
      { status: 404 }
    );
  }

  // Check for existing budget
  const existing = await db.budget.findUnique({
    where: {
      userId_categoryId_year_month: {
        userId: user.id,
        categoryId,
        year,
        month,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: 'DUPLICATE_BUDGET',
          message: 'Budget already exists for this category and month',
        },
      },
      { status: 409 }
    );
  }

  const budget = await db.budget.create({
    data: {
      userId: user.id,
      categoryId,
      year,
      month,
      targetAmount,
    },
    include: {
      category: { select: { name: true, color: true } },
    },
  });

  return NextResponse.json({ data: budget }, { status: 201 });
}
```

```typescript
// /lib/validators/budget.ts
import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  targetAmount: z.number().positive('Target amount must be positive'),
});
```

## Acceptance Criteria

1. **Given** valid budget data
   **When** POST /api/budgets
   **Then** return 201 with created budget

2. **Given** duplicate budget (same category, year, month)
   **When** POST
   **Then** return 409 "Budget already exists"

3. **Given** categoryId not owned by user
   **When** POST
   **Then** return 404

4. **Given** targetAmount ≤ 0
   **When** POST
   **Then** return 400 validation error

## Definition of Done

- [ ] POST endpoint implemented
- [ ] Validation schema created
- [ ] Uniqueness check
- [ ] Category ownership check
- [ ] Integration tests

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-CAT-002  
**Effort:** 4 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Backend Engineer)
