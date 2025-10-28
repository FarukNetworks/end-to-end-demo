'use client';

import { useState } from 'react';
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
import type { Category } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CategoryWithCount = Category & {
  _count: { txns: number };
};

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithCount;
  availableCategories: CategoryWithCount[];
  onDeleted: () => void;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  availableCategories,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [reassignTo, setReassignTo] = useState<string>('');

  const hasTransactions = category._count.txns > 0;

  // Filter categories to show only same type, excluding current category
  const reassignableCategories = availableCategories.filter(
    (c) => c.type === category.type && c.id !== category.id
  );

  const handleDelete = async () => {
    // Validate reassignment if needed
    if (hasTransactions && !reassignTo) {
      toast.error('Please select a category to reassign transactions to');
      return;
    }

    setIsDeleting(true);

    try {
      const url = `/api/categories/${category.id}${reassignTo ? `?reassignTo=${reassignTo}` : ''}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to delete category');
      }

      const message = hasTransactions
        ? `${category._count.txns} transaction(s) reassigned, category deleted`
        : 'Category deleted';
      toast.success(message);
      onDeleted();
      onOpenChange(false);
      setReassignTo('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category?</AlertDialogTitle>
          <AlertDialogDescription>
            {category.isSystem ? (
              <span className="text-destructive">
                This is a system category and cannot be deleted.
              </span>
            ) : hasTransactions ? (
              <>
                This category has <strong>{category._count.txns}</strong>{' '}
                {category._count.txns === 1 ? 'transaction' : 'transactions'}. You must reassign{' '}
                {category._count.txns === 1 ? 'it' : 'them'} to another category before deleting{' '}
                <strong>{category.name}</strong>.
              </>
            ) : (
              <>
                This will permanently delete <strong>{category.name}</strong>. This action cannot be
                undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasTransactions && !category.isSystem && (
          <div className="space-y-2">
            <label htmlFor="reassign-category" className="text-sm font-medium">
              Reassign to:
            </label>
            <Select value={reassignTo} onValueChange={setReassignTo}>
              <SelectTrigger id="reassign-category">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {reassignableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reassignableCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No other {category.type} categories available for reassignment.
              </p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {!category.isSystem && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || (hasTransactions && !reassignTo)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
