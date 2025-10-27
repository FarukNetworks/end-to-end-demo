# TASK-BUDG-001 - Implement GET /api/budgets Endpoint

## Context & Goal

**Business Value:** Retrieve user budgets for display (FR-047)  
**Epic:** EPIC-08 Budgets (Stretch - V1.1)  
**User Story:** US-BUDGET-01 - Set monthly budget per category  
**PRD Reference:** FR-047 (Budgets list)

## Scope Definition

**✅ In Scope:**

- GET /api/budgets endpoint
- Filter by year and month parameters
- User scoping
- Include category details
- Order by year, month descending

**⛔ Out of Scope:**

- Budget analytics (separate endpoint)

## Technical Specifications

```typescript
// /app/api/budgets/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year')
    ? parseInt(searchParams.get('year')!)
    : new Date().getFullYear();
  const month = searchParams.get('month')
    ? parseInt(searchParams.get('month')!)
    : undefined;

  const budgets = await db.budget.findMany({
    where: {
      userId: user.id,
      year,
      ...(month && { month }),
    },
    include: {
      category: {
        select: { name: true, color: true, type: true },
      },
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return NextResponse.json({ data: budgets });
}
```

## Acceptance Criteria

1. **Given** authenticated user
   **When** GET /api/budgets
   **Then** return all user's budgets

2. **Given** year=2025, month=10
   **When** GET /api/budgets?year=2025&month=10
   **Then** return only October 2025 budgets

3. **Given** budgets with category details
   **When** checking response
   **Then** category name and color included

## Definition of Done

- [ ] GET endpoint implemented
- [ ] Year/month filtering
- [ ] User scoping
- [ ] Include category details
- [ ] Integration tests

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-FOUND-003  
**Effort:** 3 SP  
**Priority:** P2 (Could-have)

## Assignment

**Primary Owner:** TBD (Backend Engineer)
