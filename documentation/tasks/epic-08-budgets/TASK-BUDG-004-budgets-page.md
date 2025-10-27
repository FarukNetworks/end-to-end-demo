# TASK-BUDG-004 - Build Budgets Page with List View

## Context & Goal

**Business Value:** Provide budget management interface (FR-047)  
**Epic:** EPIC-08 Budgets (Stretch - V1.1)  
**PRD Reference:** FR-047 (Budgets list), Navigation /budgets

## Scope Definition

**✅ In Scope:**

- /budgets page route
- List view grouped by month
- Progress bars showing spent/target
- Status indicators (OK/Warn/Over)
- "+ Add Budget" button

**⛔ Out of Scope:**

- Budget trends over time (V2)

## Technical Specifications

```typescript
// /app/budgets/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { BudgetList } from '@/components/budgets/budget-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function BudgetsPage() {
  const user = await requireAuth();

  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/budgets/progress`,
    {
      headers: { cookie: req.headers.get('cookie') || '' },
    }
  );

  const { data: budgets } = await response.json();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <BudgetList budgets={budgets} />
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** /budgets page
   **When** loading
   **Then** budgets displayed with progress bars

2. **Given** budget status OK
   **When** viewing
   **Then** progress bar green

3. **Given** budget status Over
   **When** viewing
   **Then** progress bar red

## Definition of Done

- [ ] /budgets page created
- [ ] BudgetList component
- [ ] Progress bars
- [ ] Status indicators
- [ ] "+ Add Budget" button

## Dependencies

**Upstream:** TASK-BUDG-003 (Progress endpoint)  
**Effort:** 5 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
