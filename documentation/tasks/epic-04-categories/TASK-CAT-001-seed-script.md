# TASK-CAT-001 - Create System Categories Seed Script

## Context & Goal

**Business Value:** Provide default categories for all users on signup (FR-016, US-006)  
**Epic:** EPIC-04 Category Management  
**User Story:** US-CAT-03 - System default categories pre-populated  
**PRD Reference:** FR-016 (Auto-create system categories)

## Scope Definition

**✅ In Scope:**

- seedDefaultCategories function (already in FOUND-007)
- 10 system categories (8 expense, 2 income)
- Category colors per design tokens
- Reusable function for AUTH-001 integration

**⛔ Out of Scope:**

- User-created categories (CAT-003)
- Category icons (V1.1)

## Technical Specifications

**Implementation Details:**

```typescript
// /lib/seed/categories.ts
import { PrismaClient, CategoryType } from '@prisma/client';

export const systemCategories = [
  // Expense categories
  { name: 'Groceries', color: '#10b981', type: CategoryType.expense },
  { name: 'Dining Out', color: '#f59e0b', type: CategoryType.expense },
  { name: 'Transport', color: '#3b82f6', type: CategoryType.expense },
  { name: 'Utilities', color: '#8b5cf6', type: CategoryType.expense },
  { name: 'Rent', color: '#ef4444', type: CategoryType.expense },
  { name: 'Entertainment', color: '#ec4899', type: CategoryType.expense },
  { name: 'Health', color: '#14b8a6', type: CategoryType.expense },
  { name: 'Shopping', color: '#f97316', type: CategoryType.expense },
  // Income categories
  { name: 'Salary', color: '#22c55e', type: CategoryType.income },
  { name: 'Other Income', color: '#84cc16', type: CategoryType.income },
] as const;

export async function createDefaultCategories(
  tx: PrismaClient,
  userId: string
) {
  const categories = await tx.category.createMany({
    data: systemCategories.map(cat => ({
      ...cat,
      userId,
      isSystem: true,
    })),
  });

  return categories;
}
```

## Acceptance Criteria

1. **Given** new user signup
   **When** account created
   **Then** 10 system categories created

2. **Given** system categories
   **When** querying database
   **Then** isSystem = true for all

3. **Given** categories with colors
   **When** checking colors
   **Then** match design tokens from PRD

4. **Given** categories by type
   **When** counting
   **Then** 8 expense + 2 income = 10 total

## Definition of Done

- [ ] seedDefaultCategories function created
- [ ] 10 system categories defined
- [ ] Colors match PRD design tokens
- [ ] isSystem flag set to true
- [ ] Function exported for AUTH-001
- [ ] Integration in signup flow (AUTH-001)
- [ ] Tested in seed script

## Dependencies

**Upstream:** TASK-FOUND-003 (Database schema)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
