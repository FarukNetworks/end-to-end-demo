# TASK-CAT-007 - Build Categories Page with List View

## Context & Goal

**Business Value:** Provide category management interface (FR-017)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-017 (Categories list), Navigation /categories

## Scope Definition

**✅ In Scope:**

- /categories page route
- List view grouped by type (expense/income)
- Color swatches display
- Edit and Delete buttons per category
- "+ Add Category" button
- System category indicators

**⛔ Out of Scope:**

- Category analytics/stats (in dashboard)

## Technical Specifications

```typescript
// /app/categories/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { CategoryList } from '@/components/categories/category-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata = {
  title: 'Categories - BudgetBuddy',
};

export default async function CategoriesPage() {
  const user = await requireAuth();

  const categories = await db.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { txns: true } },
    },
  });

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Expenses</h2>
          <CategoryList categories={expenseCategories} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Income</h2>
          <CategoryList categories={incomeCategories} />
        </div>
      </div>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** /categories page
   **When** loading
   **Then** categories grouped by type (expense/income)

2. **Given** category list
   **When** viewing
   **Then** each shows name, color swatch, action buttons

3. **Given** system category
   **When** viewing
   **Then** delete button disabled or shows "System"

4. **Given** "+ Add Category" clicked
   **When** clicking
   **Then** category form dialog opens

## Definition of Done

- [ ] /categories page created
- [ ] Server-side data fetching
- [ ] Categories grouped by type
- [ ] CategoryList component integration
- [ ] "+ Add Category" button
- [ ] Responsive layout

## Dependencies

**Upstream:** TASK-CAT-002 (GET endpoint), TASK-AUTH-003  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
