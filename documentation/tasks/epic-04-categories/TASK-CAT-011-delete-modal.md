# TASK-CAT-011 - Implement Category Deletion Confirmation Modal with Reassignment

## Context & Goal

**Business Value:** Prevent data loss when deleting categories with transactions (FR-023, FR-024)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-023 (Delete with reassignment modal), FR-024 (Confirmation)

## Scope Definition

**✅ In Scope:**

- Deletion confirmation modal
- Transaction count display
- Reassignment category dropdown (if needed)
- Two-step flow: simple delete OR delete with reassignment
- Success toast with confirmation

**⛔ Out of Scope:**

- Category merge (V2)

## Technical Specifications

```typescript
// /components/categories/delete-category-dialog.tsx
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { CategorySelect } from './category-select';

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onDeleted,
}) {
  const [transactionCount, setTransactionCount] = useState(0);
  const [reassignTo, setReassignTo] = useState('');

  useEffect(() => {
    if (open && category) {
      // Fetch or use category._count.txns
      setTransactionCount(category._count?.txns || 0);
    }
  }, [open, category]);

  const handleDelete = async () => {
    const url =
      transactionCount > 0
        ? `/api/categories/${category.id}?reassignTo=${reassignTo}`
        : `/api/categories/${category.id}`;

    const response = await fetch(url, { method: 'DELETE' });

    if (response.ok) {
      const message =
        transactionCount > 0
          ? `${transactionCount} transaction(s) reassigned, category deleted`
          : 'Category deleted';
      toast.success(message);
      onDeleted();
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{category?.name}"?</AlertDialogTitle>
          {transactionCount > 0 ? (
            <AlertDialogDescription>
              This category has {transactionCount} transaction(s). Reassign them
              to:
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {transactionCount > 0 && (
          <div className="py-4">
            <CategorySelect
              value={reassignTo}
              onChange={setReassignTo}
              type={category.type}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={transactionCount > 0 && !reassignTo}
            className="bg-destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Acceptance Criteria

1. **Given** category with 0 transactions
   **When** delete clicked
   **Then** simple confirmation modal (no reassignment)

2. **Given** category with transactions
   **When** delete clicked
   **Then** modal shows count and reassignment dropdown

3. **Given** reassignment target not selected
   **When** checking delete button
   **Then** button disabled

4. **Given** reassignment selected and confirmed
   **When** deleting
   **Then** transactions reassigned, category deleted

5. **Given** successful deletion
   **When** toast appears
   **Then** shows count if reassigned

## Definition of Done

- [ ] DeleteCategoryDialog created
- [ ] Transaction count check
- [ ] Conditional reassignment UI
- [ ] CategorySelect integration
- [ ] DELETE API call with reassignTo param
- [ ] Success toast with details
- [ ] Error handling

## Dependencies

**Upstream:** TASK-CAT-005 (DELETE endpoint), TASK-CAT-010 (CategorySelect)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
