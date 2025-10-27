# TASK-CAT-003 - Implement POST /api/categories Endpoint

## Context & Goal

**Business Value:** Enable users to create custom categories (FR-019, US-004)  
**Epic:** EPIC-04 Category Management  
**User Story:** US-CAT-01 - Create custom categories with colors  
**PRD Reference:** FR-019, FR-020 (Unique name validation)

## Scope Definition

**✅ In Scope:**

- POST /api/categories endpoint
- Name uniqueness validation (case-insensitive)
- Color and type validation
- isSystem = false for custom categories
- 409 Conflict for duplicate names

**⛔ Out of Scope:**

- Category templates (V2)

## Technical Specifications

```typescript
// /app/api/categories/route.ts
export async function POST(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const { name, color, type } = createCategorySchema.parse(body);

  // Check for duplicate name (case-insensitive)
  const existing = await db.category.findFirst({
    where: {
      userId: user.id,
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
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

  const category = await db.category.create({
    data: {
      userId: user.id,
      name,
      color: color || '#22c55e',
      type,
      isSystem: false,
    },
  });

  return NextResponse.json({ data: category }, { status: 201 });
}
```

```typescript
// /lib/validators/category.ts
import { z } from 'zod';
import { CategoryType } from '@prisma/client';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50, 'Name too long'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color')
    .optional(),
  type: z.nativeEnum(CategoryType),
});
```

## Acceptance Criteria

1. **Given** valid category data
   **When** POST /api/categories
   **Then** return 201 with created category

2. **Given** duplicate name (case-insensitive)
   **When** POST
   **Then** return 409 "Category name already exists"

3. **Given** invalid color format
   **When** POST
   **Then** return 400 validation error

4. **Given** category created
   **When** checking database
   **Then** isSystem = false

## Definition of Done

- [ ] POST endpoint implemented
- [ ] Name uniqueness check (case-insensitive)
- [ ] Validation schema created
- [ ] Default color applied if not provided
- [ ] isSystem set to false
- [ ] Integration tests passing

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-FOUND-003  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
