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
import type { Account } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AccountWithBalance = Account & {
  _count: { txns: number };
  balance: number;
};

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountWithBalance;
  availableAccounts: AccountWithBalance[];
  onDeleted: () => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
  availableAccounts,
  onDeleted,
}: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [reassignTo, setReassignTo] = useState<string>('');

  const hasTransactions = account._count.txns > 0;

  // Filter accounts to exclude current account
  const reassignableAccounts = availableAccounts.filter((a) => a.id !== account.id);

  const handleDelete = async () => {
    // Validate reassignment if needed
    if (hasTransactions && !reassignTo) {
      toast.error('Please select an account to reassign transactions to');
      return;
    }

    setIsDeleting(true);

    try {
      const url = `/api/accounts/${account.id}${reassignTo ? `?reassignTo=${reassignTo}` : ''}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to delete account');
      }

      const message = hasTransactions
        ? `${account._count.txns} transaction(s) reassigned, account deleted`
        : 'Account deleted';
      toast.success(message);
      onDeleted();
      onOpenChange(false);
      setReassignTo('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasTransactions ? (
              <>
                This account has <strong>{account._count.txns}</strong>{' '}
                {account._count.txns === 1 ? 'transaction' : 'transactions'}. You must reassign{' '}
                {account._count.txns === 1 ? 'it' : 'them'} to another account before deleting{' '}
                <strong>{account.name}</strong>.
              </>
            ) : (
              <>
                This will permanently delete <strong>{account.name}</strong>. This action cannot be
                undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasTransactions && (
          <div className="space-y-2">
            <label htmlFor="reassign-account" className="text-sm font-medium">
              Reassign to:
            </label>
            <Select value={reassignTo} onValueChange={setReassignTo}>
              <SelectTrigger id="reassign-account">
                <SelectValue placeholder="Select an account..." />
              </SelectTrigger>
              <SelectContent>
                {reassignableAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: acc.color }}
                      />
                      <span>{acc.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reassignableAccounts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No other accounts available for reassignment. Create another account first.
              </p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || (hasTransactions && !reassignTo)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
