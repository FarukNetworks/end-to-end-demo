# TASK-TXN-004 - Implement DELETE /api/transactions/:id Endpoint

## Context & Goal

**Business Value:** Enable users to remove incorrect or duplicate transactions (FR-013)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** FR-013 (Confirm transaction deletion)

## Scope Definition

**✅ In Scope:**

- DELETE /api/transactions/:id endpoint
- User scoping (can only delete own transactions)
- Hard delete from database
- 204 No Content on success
- 404 if not found or unauthorized

**⛔ Out of Scope:**

- Soft delete (V2)
- Bulk delete (TASK-TXN-013)
- Deletion confirmation UI (TASK-TXN-011)

## Technical Specifications

**Implementation Details:**

```typescript
// /app/api/transactions/[id]/route.ts
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const deleted = await deleteTransaction(user.id, params.id);

  if (!deleted) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Transaction not found' } },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
```

## Acceptance Criteria

1. **Given** user owns transaction
   **When** DELETE /api/transactions/:id
   **Then** return 204 and remove from database

2. **Given** transaction belongs to different user
   **When** DELETE /api/transactions/:id
   **Then** return 404 Not Found

3. **Given** non-existent transaction ID
   **When** DELETE /api/transactions/:id
   **Then** return 404 Not Found

4. **Given** successful deletion
   **When** attempting to GET same transaction
   **Then** return 404 (no longer exists)

## Definition of Done

- [ ] DELETE endpoint implemented
- [ ] User scoping enforced
- [ ] Hard delete from database
- [ ] 204 response on success
- [ ] 404 for not found/unauthorized
- [ ] Integration tests passing

## Dependencies

**Upstream:** TASK-TXN-001, TASK-AUTH-003  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)
