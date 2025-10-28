'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AccountDialog } from './account-dialog';
import { DeleteAccountDialog } from './delete-account-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/chart-utils';
import type { Account } from '@prisma/client';

type AccountWithBalance = Account & {
  _count: { txns: number };
  balance: number;
};

interface AccountListProps {
  accounts: AccountWithBalance[];
}

export function AccountList({ accounts }: AccountListProps) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [editingAccount, setEditingAccount] = useState<AccountWithBalance | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AccountWithBalance | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = (account: AccountWithBalance) => {
    setEditingAccount(account);
    setEditDialogOpen(true);
  };

  const handleDelete = (account: AccountWithBalance) => {
    setDeletingAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    // Refresh the page data
    router.refresh();
  };

  if (accounts.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No accounts yet</p>
      </Card>
    );
  }

  return (
    <>
      {isMobile ? (
        // Mobile card layout
        <div className="space-y-2">
          {accounts.map((account) => (
            <Card key={account.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account._count.txns}{' '}
                      {account._count.txns === 1 ? 'transaction' : 'transactions'}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(account.balance)}</div>
                    <div className="text-xs text-muted-foreground">Balance</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                      aria-label={`Edit ${account.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account)}
                      aria-label={`Delete ${account.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop table layout
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-12 p-4 text-left font-medium"></th>
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Transactions</th>
                  <th className="p-4 text-right font-medium">Balance</th>
                  <th className="w-32 p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="p-4">
                      <span
                        className="block h-4 w-4 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{account.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {account._count.txns}{' '}
                      {account._count.txns === 1 ? 'transaction' : 'transactions'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-semibold">{formatCurrency(account.balance)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(account)}
                          aria-label={`Edit ${account.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account)}
                          aria-label={`Delete ${account.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editingAccount && (
        <AccountDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          account={editingAccount}
          mode="edit"
          onSuccess={handleSuccess}
        />
      )}

      {deletingAccount && (
        <DeleteAccountDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          account={deletingAccount}
          availableAccounts={accounts}
          onDeleted={handleSuccess}
        />
      )}
    </>
  );
}
