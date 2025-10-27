'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { TransactionFormFields } from './transaction-form-fields';
import type { Transaction } from '@prisma/client';

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  mode: 'create' | 'edit';
}

export function TransactionDrawer({
  open,
  onOpenChange,
  transaction,
  mode,
}: TransactionDrawerProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    // If closing and form is dirty, show confirmation
    if (!newOpen && isDirty) {
      setShowConfirmation(true);
    } else {
      onOpenChange(newOpen);
      // Reset dirty state when drawer closes
      if (!newOpen) {
        setIsDirty(false);
      }
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setIsDirty(false);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  const handleSuccess = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>{mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TransactionFormFields
              transaction={transaction}
              mode={mode}
              onSuccess={handleSuccess}
              onDirtyChange={setIsDirty}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>Continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Discard changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
