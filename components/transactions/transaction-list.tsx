'use client';

import { useState } from 'react';
import { TransactionRow, type TransactionWithRelations } from './transaction-row';
import { TransactionCard } from './transaction-card';
import { TransactionDrawer } from './transaction-drawer';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/chart-utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface TransactionListProps {
  transactions: TransactionWithRelations[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithRelations | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleRowClick = (transaction: TransactionWithRelations) => {
    setEditingTransaction(transaction);
    setEditOpen(true);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, transaction: TransactionWithRelations) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(transaction);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div>
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onClearSelection={clearSelection}
        />
      )}

      {isMobile ? (
        // Mobile card layout
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              isSelected={selectedIds.includes(transaction.id)}
              onToggleSelection={() => toggleSelection(transaction.id)}
              onClick={() => handleRowClick(transaction)}
            />
          ))}
        </div>
      ) : (
        // Desktop table layout
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-12 p-2">
                  <Checkbox
                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all transactions"
                  />
                </th>
                <th className="p-2 text-left font-medium">Date</th>
                <th className="p-2 text-right font-medium">Amount</th>
                <th className="p-2 text-left font-medium">Category</th>
                <th className="p-2 text-left font-medium">Account</th>
                <th className="p-2 text-left font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                  onClick={() => handleRowClick(transaction)}
                  onKeyDown={(e) => handleRowKeyDown(e, transaction)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit transaction: ${formatCurrency(Number(transaction.amount))} for ${transaction.category.name}`}
                >
                  <td className="p-2" onClick={handleCheckboxClick}>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => toggleSelection(transaction.id)}
                      aria-label={`Select transaction ${transaction.id}`}
                    />
                  </td>
                  <TransactionRow transaction={transaction} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTransaction && (
        <TransactionDrawer
          open={editOpen}
          onOpenChange={setEditOpen}
          transaction={editingTransaction}
          mode="edit"
        />
      )}
    </div>
  );
}
