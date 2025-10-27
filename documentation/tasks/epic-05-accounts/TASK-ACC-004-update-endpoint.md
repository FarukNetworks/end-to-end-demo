# TASK-ACC-004 - Implement PATCH /api/accounts/:id Endpoint

## Context & Goal

**Business Value:** Allow users to edit account names and colors (FR-031)  
**Epic:** EPIC-05 Account Management  
**PRD Reference:** FR-031 (Edit account)

## Scope Definition

**✅ In Scope:**

- PATCH /api/accounts/:id endpoint
- Update name and color
- User scoping
- Name uniqueness validation

**⛔ Out of Scope:**

- Account type changes (V2)

## Technical Specifications

```typescript
// /app/api/accounts/[id]/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const { name, color } = updateAccountSchema.parse(body);

  // Verify ownership
  const account = await db.account.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!account) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Account not found' } },
      { status: 404 }
    );
  }

  // Check duplicate name if changing name
  if (name && name !== account.name) {
    const duplicate = await db.account.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: 'insensitive' },
        id: { not: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_NAME',
            message: 'Account name already exists',
          },
        },
        { status: 409 }
      );
    }
  }

  const updated = await db.account.update({
    where: { id: params.id },
    data: { name, color },
  });

  return NextResponse.json({ data: updated });
}
```

## Acceptance Criteria

1. **Given** user owns account
   **When** PATCH /api/accounts/:id
   **Then** account updated

2. **Given** account belongs to different user
   **When** PATCH
   **Then** return 404

3. **Given** new name duplicates existing
   **When** PATCH
   **Then** return 409

## Definition of Done

- [ ] PATCH endpoint implemented
- [ ] User scoping
- [ ] Name uniqueness check
- [ ] Integration tests

## Dependencies

**Upstream:** TASK-ACC-002, TASK-AUTH-003  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
