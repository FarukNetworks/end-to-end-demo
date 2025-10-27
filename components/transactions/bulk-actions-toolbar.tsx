'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Trash2 } from 'lucide-react';
import { BulkDeleteDialog } from './bulk-delete-dialog';
import { BulkReassignDialog } from './bulk-reassign-dialog';

interface BulkActionsToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  selectedIds,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  return (
    <Card className="sticky top-0 z-10 mb-4 flex items-center justify-between border-primary/50 bg-primary/5 p-4">
      <div className="flex items-center gap-4">
        <span className="font-medium">
          {selectedCount} {selectedCount === 1 ? 'transaction' : 'transactions'} selected
        </span>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete selected transactions"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReassignOpen(true)}
            aria-label="Reassign category for selected transactions"
          >
            Reassign Category
          </Button>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onClearSelection} aria-label="Clear selection">
        <X className="mr-1 h-4 w-4" />
        Clear
      </Button>

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transactionIds={selectedIds}
        onDeleted={onClearSelection}
      />

      <BulkReassignDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        transactionIds={selectedIds}
        onReassigned={onClearSelection}
      />
    </Card>
  );
}
