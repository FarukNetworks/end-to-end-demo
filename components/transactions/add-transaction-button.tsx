'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionDrawer } from './transaction-drawer';

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: Header button */}
      <Button onClick={() => setOpen(true)} className="hidden gap-2 md:flex">
        <Plus className="h-4 w-4" />
        Add Transaction
      </Button>

      {/* Mobile: FAB */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Transaction</span>
      </Button>

      <TransactionDrawer open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
