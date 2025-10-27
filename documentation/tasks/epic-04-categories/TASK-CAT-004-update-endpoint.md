# TASK-CAT-004 - Implement PATCH /api/categories/:id Endpoint

## Context & Goal

**Business Value:** Allow users to edit custom category names and colors (FR-021)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-021 (Edit category)

## Scope Definition

**✅ In Scope:**

- PATCH /api/categories/:id endpoint
- Update name and color (type immutable)
- User scoping
- Name uniqueness validation on update

**⛔ Out of Scope:**

- Editing system categories (prevented by validation)
- Bulk category update (V2)

## Technical Specifications

```typescript
// /app/api/categories/[id]/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const { name, color } = updateCategorySchema.parse(body);

  // Verify ownership
  const category = await db.category.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!category) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Category not found' } },
      { status: 404 }
    );
  }

  // Check duplicate name
  if (name && name !== category.name) {
    const duplicate = await db.category.findFirst({
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
            message: 'Category name already exists',
          },
        },
        { status: 409 }
      );
    }
  }

  const updated = await db.category.update({
    where: { id: params.id },
    data: { name, color },
  });

  return NextResponse.json({ data: updated });
}
```

## Acceptance Criteria

1. **Given** user owns category
   **When** PATCH /api/categories/:id with new name
   **Then** category updated and returned

2. **Given** category belongs to different user
   **When** PATCH
   **Then** return 404

3. **Given** new name duplicates existing
   **When** PATCH
   **Then** return 409

4. **Given** system category
   **When** attempting to update
   **Then** allowed (but UI should prevent this)

## Definition of Done

- [ ] PATCH endpoint implemented
- [ ] User scoping enforced
- [ ] Name uniqueness validation
- [ ] Type field immutable (not in update schema)
- [ ] Integration tests passing

## Dependencies

**Upstream:** TASK-CAT-002, TASK-AUTH-003  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
