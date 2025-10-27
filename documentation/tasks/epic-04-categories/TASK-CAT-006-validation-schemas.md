# TASK-CAT-006 - Create Category Validation Schemas (Zod)

## Context & Goal

**Business Value:** Ensure category data quality and prevent invalid categories (FR-020)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-019, FR-020 (Validation)

## Scope Definition

**✅ In Scope:**

- createCategorySchema
- updateCategorySchema
- Type validation (expense/income)
- Color hex validation
- Name length limits

**⛔ Out of Scope:**

- Backend uniqueness check (in endpoint)

## Technical Specifications

```typescript
// /lib/validators/category.ts
import { z } from 'zod';
import { CategoryType } from '@prisma/client';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name too long (max 50 characters)')
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)')
    .optional()
    .default('#22c55e'),
  type: z.nativeEnum(CategoryType, {
    errorMap: () => ({ message: 'Type must be expense or income' }),
  }),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
  // type is immutable - not included in update schema
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
```

## Acceptance Criteria

1. **Given** empty name
   **When** validating
   **Then** error "Name is required"

2. **Given** name >50 characters
   **When** validating
   **Then** error "Name too long"

3. **Given** invalid color "#GGG"
   **When** validating
   **Then** error "Invalid color format"

4. **Given** valid hex color "#FF5733"
   **When** validating
   **Then** validation passes

5. **Given** type not expense/income
   **When** validating
   **Then** error "Type must be expense or income"

## Definition of Done

- [ ] createCategorySchema defined
- [ ] updateCategorySchema defined
- [ ] Type exports
- [ ] Unit tests (>95% coverage)
- [ ] Used in CAT-003, CAT-004

## Dependencies

**Upstream:** TASK-FOUND-005 (Zod)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
