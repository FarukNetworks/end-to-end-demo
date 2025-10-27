# TASK-CAT-005 - Implement DELETE /api/categories/:id with Reassignment

## Context & Goal

**Business Value:** Enable safe category deletion without losing transaction data (FR-023 to FR-025)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-023 (Delete with reassignment), FR-024, FR-025

## Scope Definition

**✅ In Scope:**

- DELETE /api/categories/:id endpoint
- Check for linked transactions
- Require reassignTo parameter if transactions exist
- Prevent system category deletion
- Update transactions before deleting category

**⛔ Out of Scope:**

- Soft delete (V2)
- Category archive (V2)

## Technical Specifications

```typescript
// /app/api/categories/[id]/route.ts
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const reassignTo = searchParams.get('reassignTo');

  // Verify ownership
  const category = await db.category.findFirst({
    where: { id: params.id, userId: user.id },
    include: { _count: { select: { txns: true } } },
  });

  if (!category) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Category not found' } },
      { status: 404 }
    );
  }

  // Prevent system category deletion
  if (category.isSystem) {
    return NextResponse.json(
      {
        error: {
          code: 'SYSTEM_CATEGORY',
          message: 'Cannot delete system category',
        },
      },
      { status: 400 }
    );
  }

  // Check for transactions
  if (category._count.txns > 0) {
    if (!reassignTo) {
      return NextResponse.json(
        {
          error: {
            code: 'HAS_TRANSACTIONS',
            message: 'Category has transactions. Provide reassignTo parameter.',
            details: { transactionCount: category._count.txns },
          },
        },
        { status: 400 }
      );
    }

    // Verify reassignTo category exists and belongs to user
    const targetCategory = await db.category.findFirst({
      where: { id: reassignTo, userId: user.id },
    });

    if (!targetCategory) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REASSIGN',
            message: 'Target category not found',
          },
        },
        { status: 404 }
      );
    }

    // Reassign transactions then delete category
    await db.$transaction([
      db.transaction.updateMany({
        where: { categoryId: params.id, userId: user.id },
        data: { categoryId: reassignTo },
      }),
      db.category.delete({ where: { id: params.id } }),
    ]);
  } else {
    // No transactions, safe to delete
    await db.category.delete({ where: { id: params.id } });
  }

  return new NextResponse(null, { status: 204 });
}
```

## Acceptance Criteria

1. **Given** category with no transactions
   **When** DELETE /api/categories/:id
   **Then** category deleted, return 204

2. **Given** category with transactions, no reassignTo
   **When** DELETE
   **Then** return 400 with transaction count

3. **Given** category with transactions, valid reassignTo
   **When** DELETE
   **Then** transactions reassigned, category deleted

4. **Given** system category
   **When** DELETE
   **Then** return 400 "Cannot delete system category"

5. **Given** reassignTo invalid ID
   **When** DELETE
   **Then** return 404 "Target category not found"

## Definition of Done

- [ ] DELETE endpoint implemented
- [ ] System category protection
- [ ] Transaction count check
- [ ] Reassignment logic
- [ ] Atomic transaction (reassign + delete)
- [ ] Integration tests for all scenarios

## Dependencies

**Upstream:** TASK-CAT-002, TASK-AUTH-003  
**Effort:** 6 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
