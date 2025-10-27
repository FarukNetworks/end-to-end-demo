# TASK-TXN-003 - Implement PATCH /api/transactions/:id Endpoint

## Context & Goal

**Business Value:** Enable users to correct transaction mistakes without deleting and re-entering (FR-011, US-002)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-02 - As a user, I want to edit transactions I logged incorrectly  
**PRD Reference:** FR-011 (Update transaction)

## Scope Definition

**✅ In Scope:**

- PATCH /api/transactions/:id endpoint
- Partial update support (only changed fields)
- Validation (same as create)
- User scoping (can only update own transactions)
- Type/category validation
- updatedAt timestamp automatic update

**⛔ Out of Scope:**

- Transaction history/audit log (V2)
- Bulk edit (separate endpoint)

## Technical Specifications

**Implementation Details:**

```typescript
// /app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { updateTransaction } from '@/lib/queries/transactions';
import { updateTransactionSchema } from '@/lib/validators/transaction';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const validatedData = updateTransactionSchema.parse(body);

  // Verify ownership and update
  const updated = await updateTransaction(user.id, params.id, validatedData);

  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Transaction not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: updated });
}
```

## Acceptance Criteria

1. **Given** authenticated user owns transaction
   **When** PATCH /api/transactions/:id with valid data
   **Then** return 200 with updated transaction

2. **Given** transaction belongs to different user
   **When** PATCH /api/transactions/:id
   **Then** return 404 Not Found

3. **Given** partial update (only amount changed)
   **When** PATCH /api/transactions/:id
   **Then** only amount updated, other fields unchanged

4. **Given** invalid data (amount ≤ 0)
   **When** PATCH /api/transactions/:id
   **Then** return 400 with validation error

5. **Given** successful update
   **When** checking database
   **Then** updatedAt timestamp is current time

## Definition of Done

- [ ] PATCH endpoint implemented
- [ ] updateTransactionSchema validation created
- [ ] User scoping enforced
- [ ] Partial updates supported
- [ ] 404 for non-existent or unauthorized
- [ ] updatedAt timestamp updates
- [ ] Integration tests passing

## Dependencies

**Upstream:** TASK-TXN-001, TASK-AUTH-003  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)
