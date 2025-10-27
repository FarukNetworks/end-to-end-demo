# TASK-TXN-011 - Build Transaction Deletion Confirmation Modal

## Context & Goal

**Business Value:** Prevent accidental deletions with confirmation modal (FR-012, UX-013)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** FR-012 (Delete confirmation), UX-013 (AlertDialog)

## Scope Definition

**✅ In Scope:**

- AlertDialog component for deletion confirmation
- Display transaction details (amount, category)
- Cancel and Confirm buttons
- Delete action integration
- Accessible modal (Esc to close, focus trap)

**⛔ Out of Scope:**

- Undo after deletion (V1.1)
- Soft delete (V2)

## Technical Specifications

```typescript
// /components/transactions/delete-transaction-dialog.tsx
'use client';

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
import { formatCurrency } from '@/lib/chart-utils';
import { toast } from '@/lib/toast';

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onDeleted: () => void;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      toast.success('Transaction deleted');
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the transaction of{' '}
            <strong>{formatCurrency(transaction.amount)}</strong> in{' '}
            <strong>{transaction.category.name}</strong>. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

1. **Given** delete button clicked
   **When** modal opens
   **Then** displays transaction amount and category

2. **Given** modal open
   **When** clicking Cancel
   **Then** modal closes, no deletion

3. **Given** modal open
   **When** clicking Delete (confirm)
   **Then** DELETE API called and modal closes

4. **Given** successful deletion
   **When** checking list
   **Then** transaction removed

5. **Given** modal open
   **When** pressing Esc
   **Then** modal closes without deleting

## Definition of Done

- [ ] DeleteTransactionDialog component created
- [ ] shadcn/ui AlertDialog integration
- [ ] Displays transaction details
- [ ] Cancel and Confirm buttons
- [ ] DELETE API integration
- [ ] Toast notifications
- [ ] Accessible (Esc, focus trap)
- [ ] Destructive styling on confirm button

## Dependencies

**Upstream:** TASK-FOUND-002 (AlertDialog), TASK-TXN-004 (DELETE endpoint)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
