# TASK-ACC-005 - Implement DELETE /api/accounts/:id with Reassignment

## Context & Goal

**Business Value:** Enable safe account deletion without losing transaction data (FR-032 to FR-034)  
**Epic:** EPIC-05 Account Management  
**PRD Reference:** FR-032 (Delete with reassignment), FR-033, FR-034

## Scope Definition

**✅ In Scope:**

- DELETE /api/accounts/:id endpoint
- Check for linked transactions
- Require reassignTo parameter if transactions exist
- Update transactions before deleting account
- Atomic transaction

**⛔ Out of Scope:**

- Account archive (V2)

## Technical Specifications

```typescript
// /app/api/accounts/[id]/route.ts
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const reassignTo = searchParams.get('reassignTo');

  const account = await db.account.findFirst({
    where: { id: params.id, userId: user.id },
    include: { _count: { select: { txns: true } } },
  });

  if (!account) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Account not found' } },
      { status: 404 }
    );
  }

  if (account._count.txns > 0) {
    if (!reassignTo) {
      return NextResponse.json(
        {
          error: {
            code: 'HAS_TRANSACTIONS',
            message: 'Account has transactions. Provide reassignTo parameter.',
            details: { transactionCount: account._count.txns },
          },
        },
        { status: 400 }
      );
    }

    const targetAccount = await db.account.findFirst({
      where: { id: reassignTo, userId: user.id },
    });

    if (!targetAccount) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REASSIGN',
            message: 'Target account not found',
          },
        },
        { status: 404 }
      );
    }

    await db.$transaction([
      db.transaction.updateMany({
        where: { accountId: params.id, userId: user.id },
        data: { accountId: reassignTo },
      }),
      db.account.delete({ where: { id: params.id } }),
    ]);
  } else {
    await db.account.delete({ where: { id: params.id } });
  }

  return new NextResponse(null, { status: 204 });
}
```

## Acceptance Criteria

1. **Given** account with no transactions
   **When** DELETE /api/accounts/:id
   **Then** account deleted, return 204

2. **Given** account with transactions, no reassignTo
   **When** DELETE
   **Then** return 400 with transaction count

3. **Given** account with transactions, valid reassignTo
   **When** DELETE
   **Then** transactions reassigned, account deleted

4. **Given** reassignTo invalid
   **When** DELETE
   **Then** return 404

## Definition of Done

- [ ] DELETE endpoint implemented
- [ ] Transaction count check
- [ ] Reassignment logic
- [ ] Atomic transaction
- [ ] Integration tests

## Dependencies

**Upstream:** TASK-ACC-002, TASK-AUTH-003  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
