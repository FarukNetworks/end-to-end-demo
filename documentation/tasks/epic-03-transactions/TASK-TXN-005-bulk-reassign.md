# TASK-TXN-005 - Implement POST /api/transactions/bulk/reassign Endpoint

## Context & Goal

**Business Value:** Enable users to quickly fix categorization mistakes across multiple transactions (FR-015, US-005)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-05 - As a user, I want to reassign multiple transactions to a different category  
**PRD Reference:** FR-015 (Bulk category reassignment)

## Scope Definition

**✅ In Scope:**

- POST /api/transactions/bulk/reassign endpoint
- Accept array of transaction IDs and new categoryId
- Validate category ownership and type compatibility
- User scoping (only reassign own transactions)
- Return count of updated transactions

**⛔ Out of Scope:**

- Bulk edit of other fields (V1.1)
- Transaction history tracking (V2)

## Technical Specifications

**Implementation Details:**

```typescript
// /app/api/transactions/bulk/reassign/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { bulkReassignCategory } from '@/lib/queries/transactions';
import { z } from 'zod';
import { db } from '@/lib/db';

const bulkReassignSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  categoryId: z.string().uuid(),
});

export async function POST(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const { ids, categoryId } = bulkReassignSchema.parse(body);

  // Verify category belongs to user
  const category = await db.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });

  if (!category) {
    return NextResponse.json(
      { error: { code: 'INVALID_CATEGORY', message: 'Category not found' } },
      { status: 404 }
    );
  }

  // Reassign transactions (automatically scoped to userId)
  const updated = await bulkReassignCategory(user.id, ids, categoryId);

  return NextResponse.json({
    updated,
    message: `${updated} transaction(s) reassigned`,
  });
}
```

## Acceptance Criteria

1. **Given** valid transaction IDs and category
   **When** POST /api/transactions/bulk/reassign
   **Then** return count of updated transactions

2. **Given** IDs include transactions from another user
   **When** bulk reassign
   **Then** only current user's transactions updated

3. **Given** categoryId belongs to different user
   **When** bulk reassign
   **Then** return 404 Category not found

4. **Given** empty IDs array
   **When** bulk reassign
   **Then** return 400 validation error

5. **Given** >100 IDs in array
   **When** bulk reassign
   **Then** return 400 validation error (max limit)

## Definition of Done

- [ ] POST bulk/reassign endpoint implemented
- [ ] Validation schema created
- [ ] Category ownership check
- [ ] User scoping on transactions
- [ ] Return updated count
- [ ] Max 100 IDs limit enforced
- [ ] Integration tests passing

## Dependencies

**Upstream:** TASK-TXN-001, TASK-CAT-001  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)
