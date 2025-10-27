# TASK-TXN-014 - Create Bulk Category Reassignment Functionality

## Context & Goal

**Business Value:** Enable quick correction of categorization mistakes (FR-015, US-005)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-05 - Bulk reassign transaction categories  
**PRD Reference:** FR-015 (Bulk category reassignment)

## Scope Definition

**✅ In Scope:**

- "Change Category" button in bulk actions toolbar
- Category selection dialog
- POST to bulk/reassign endpoint
- Success toast with count
- Clear selection after reassignment

**⛔ Out of Scope:**

- Bulk edit of other fields (V1.1)

## Technical Specifications

```typescript
// /components/transactions/bulk-reassign-dialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CategorySelect } from '@/components/categories/category-select';
import { toast } from '@/lib/toast';

export function BulkReassignDialog({
  open,
  onOpenChange,
  transactionIds,
  onReassigned,
}) {
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReassign = async () => {
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/transactions/bulk/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: transactionIds,
          categoryId,
        }),
      });

      if (!response.ok) throw new Error('Reassignment failed');

      const result = await response.json();
      toast.success(`${result.updated} transaction(s) updated`);
      onReassigned();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to reassign transactions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Change category for {transactionIds.length} transactions
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CategorySelect
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select new category..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReassign} disabled={!categoryId || isLoading}>
            {isLoading ? 'Updating...' : 'Update Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Acceptance Criteria

1. **Given** transactions selected
   **When** clicking "Change Category"
   **Then** category selection dialog opens

2. **Given** category selected and confirmed
   **When** submitting
   **Then** POST to bulk/reassign endpoint

3. **Given** successful reassignment
   **When** checking list
   **Then** all selected transactions show new category

4. **Given** reassignment completes
   **When** checking toast
   **Then** shows "{N} transaction(s) updated"

## Definition of Done

- [ ] BulkReassignDialog component created
- [ ] Category selection integration
- [ ] POST to bulk/reassign endpoint
- [ ] Success toast with count
- [ ] Clear selection after reassignment
- [ ] Error handling
- [ ] Loading state

## Dependencies

**Upstream:** TASK-TXN-012 (Bulk selection), TASK-TXN-005 (Bulk reassign endpoint), TASK-CAT-010 (Category select)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
