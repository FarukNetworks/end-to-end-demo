# TASK-ACC-006 - Create Account Validation Schemas (Zod)

## Context & Goal

**Business Value:** Ensure account data quality (FR-030)  
**Epic:** EPIC-05 Account Management  
**PRD Reference:** FR-029, FR-030 (Validation)

## Scope Definition

**✅ In Scope:**

- createAccountSchema
- updateAccountSchema
- Name and color validation

**⛔ Out of Scope:**

- Backend uniqueness (in endpoint)

## Technical Specifications

```typescript
// /lib/validators/account.ts (already shown in ACC-003)
import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name too long (max 50 characters)')
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)')
    .optional()
    .default('#6b7280'),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
```

## Acceptance Criteria

1. **Given** empty name
   **When** validating
   **Then** error "Name is required"

2. **Given** name >50 characters
   **When** validating
   **Then** error "Name too long"

3. **Given** invalid color
   **When** validating
   **Then** error "Invalid color format"

4. **Given** no color provided
   **When** validating with createSchema
   **Then** default #6b7280 applied

## Definition of Done

- [ ] createAccountSchema defined
- [ ] updateAccountSchema defined
- [ ] Type exports
- [ ] Unit tests (>95% coverage)
- [ ] Used in ACC-003, ACC-004

## Dependencies

**Upstream:** TASK-FOUND-005 (Zod)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
