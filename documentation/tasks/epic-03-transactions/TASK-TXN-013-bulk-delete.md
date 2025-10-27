# TASK-TXN-013 - Create Bulk Delete Functionality

## Context & Goal

**Business Value:** Allow users to quickly remove multiple incorrect transactions (FR-014, US-003)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-03 - Delete multiple transactions at once  
**PRD Reference:** FR-014 (Bulk delete)

## Scope Definition

**✅ In Scope:**

- Bulk delete button in toolbar
- Confirmation modal showing count
- DELETE requests or dedicated bulk endpoint
- Clear selection after deletion
- Success toast with count

**⛔ Out of Scope:**

- Undo after bulk delete (V1.1)

## Technical Specifications

```typescript
// /components/transactions/bulk-actions-toolbar.tsx
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BulkDeleteDialog } from './bulk-delete-dialog';

export function BulkActionsToolbar({
  selectedCount,
  selectedIds,
  onClearSelection,
}: {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="mb-4 flex items-center gap-4 rounded-lg border bg-muted p-4">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear selection
      </Button>

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transactionIds={selectedIds}
        onDeleted={onClearSelection}
      />
    </div>
  );
}
```

```typescript
// /components/transactions/bulk-delete-dialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/lib/toast';

export function BulkDeleteDialog({
  open,
  onOpenChange,
  transactionIds,
  onDeleted,
}) {
  const handleDelete = async () => {
    try {
      // Option 1: Sequential deletes
      await Promise.all(
        transactionIds.map(id =>
          fetch(`/api/transactions/${id}`, { method: 'DELETE' })
        )
      );

      toast.success(`${transactionIds.length} transaction(s) deleted`);
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete transactions');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {transactionIds.length} transactions?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            selected transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Acceptance Criteria

1. **Given** ≥2 transactions selected
   **When** clicking Delete button
   **Then** confirmation modal shows count

2. **Given** delete confirmation
   **When** clicking Confirm
   **Then** all selected transactions deleted

3. **Given** successful bulk delete
   **When** checking list
   **Then** all deleted transactions removed

4. **Given** bulk delete completes
   **When** checking toast
   **Then** shows "{N} transaction(s) deleted"

## Definition of Done

- [ ] Bulk delete button in toolbar
- [ ] Confirmation dialog with count
- [ ] DELETE API calls for selected IDs
- [ ] Success toast with count
- [ ] Clear selection after delete
- [ ] Error handling

## Dependencies

**Upstream:** TASK-TXN-012 (Bulk selection), TASK-TXN-004 (DELETE endpoint)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
