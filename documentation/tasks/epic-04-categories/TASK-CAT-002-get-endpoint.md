# TASK-CAT-002 - Implement GET /api/categories Endpoint

## Context & Goal

**Business Value:** Retrieve user's categories for dropdowns and management page (FR-017)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-017 (Categories list)

## Scope Definition

**✅ In Scope:**

- GET /api/categories endpoint
- User scoping
- Return all categories (system + custom)
- Order by type then name
- Include usage count (optional)

**⛔ Out of Scope:**

- Category analytics (DASH endpoints)

## Technical Specifications

```typescript
// /app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const categories = await db.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { txns: true },
      },
    },
  });

  return NextResponse.json({ data: categories });
}
```

## Acceptance Criteria

1. **Given** authenticated user
   **When** GET /api/categories
   **Then** return all user's categories (system + custom)

2. **Given** categories returned
   **When** checking order
   **Then** sorted by type (expense first), then name alphabetically

3. **Given** category with transactions
   **When** checking response
   **Then** \_count.txns shows transaction count

4. **Given** unauthenticated request
   **When** GET /api/categories
   **Then** return 401 Unauthorized

## Definition of Done

- [ ] GET endpoint implemented
- [ ] User scoping enforced
- [ ] Ordered by type and name
- [ ] Transaction count included
- [ ] Integration test passing

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-CAT-001  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
