'use client';

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
import { useTransactions } from '@/hooks/use-transactions';

interface BulkReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionIds: string[];
  onReassigned: () => void;
}

export function BulkReassignDialog({
  open,
  onOpenChange,
  transactionIds,
  onReassigned,
}: BulkReassignDialogProps) {
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { bulkReassignCategory } = useTransactions();

  const handleReassign = async () => {
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    setIsLoading(true);

    try {
      await bulkReassignCategory(transactionIds, categoryId);
      toast.success(`${transactionIds.length} transaction(s) updated`);
      onReassigned();
      onOpenChange(false);
      setCategoryId(''); // Reset selection for next use
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reassign transactions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Change category for {transactionIds.length}{' '}
            {transactionIds.length === 1 ? 'transaction' : 'transactions'}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
