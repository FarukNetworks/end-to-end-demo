'use client';

import { useTransactions } from '@/hooks/use-transactions';
import { TransactionList } from '@/components/transactions/transaction-list';
import { AddTransactionButton } from '@/components/transactions/add-transaction-button';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/empty-state';

export default function DashboardPage() {
  const { transactions, isLoading, error } = useTransactions();

  if (error) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-destructive">
              Error loading transactions
            </h2>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <AddTransactionButton />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Get started by adding your first transaction"
          />
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
}
