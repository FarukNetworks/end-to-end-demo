import useSWR from 'swr';
import type { Transaction, CategoryType } from '@prisma/client';
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from '@/lib/validators/transaction';

export type TransactionWithRelations = Transaction & {
  category: { name: string; color: string; type: CategoryType };
  account: { name: string };
};

interface TransactionsResponse {
  data: TransactionWithRelations[];
  total: number;
}

/**
 * Fetcher function for SWR
 */
async function fetcher(url: string): Promise<TransactionsResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch transactions');
  }

  return response.json();
}

/**
 * Build query string from filters
 */
function buildQueryString(filters?: TransactionFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.from) params.append('from', filters.from.toISOString());
  if (filters.to) params.append('to', filters.to.toISOString());
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.accountId) params.append('accountId', filters.accountId);
  if (filters.type) params.append('type', filters.type);
  if (filters.q) params.append('q', filters.q);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Custom hook for transaction CRUD with optimistic updates
 * Implements optimistic UI pattern from TASK-TXN-016
 */
export function useTransactions(filters?: TransactionFilters) {
  const queryString = buildQueryString(filters);
  const apiUrl = `/api/transactions${queryString}`;

  const { data, error, mutate, isLoading } = useSWR<TransactionsResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  /**
   * Add transaction with optimistic update
   */
  const addTransaction = async (transaction: CreateTransactionInput) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTransaction: TransactionWithRelations = {
      id: tempId,
      userId: 'current-user',
      amount: transaction.amount as any, // Client-side optimistic update, actual Decimal conversion happens server-side
      currency: 'EUR',
      type: transaction.type,
      txnDate: transaction.txnDate,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      note: transaction.note || null,
      tags: transaction.tags || [],
      attachmentUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        name: 'Loading...',
        color: '#cccccc',
        type: transaction.type,
      },
      account: {
        name: 'Loading...',
      },
    };

    await mutate(
      async () => {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to create transaction');
        }

        const result = await response.json();
        return {
          data: [result.data, ...(data?.data || [])],
          total: (data?.total || 0) + 1,
        };
      },
      {
        optimisticData: {
          data: [optimisticTransaction, ...(data?.data || [])],
          total: (data?.total || 0) + 1,
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  /**
   * Update transaction with optimistic update
   */
  const updateTransaction = async (id: string, updates: UpdateTransactionInput) => {
    await mutate(
      async () => {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to update transaction');
        }

        const result = await response.json();
        return {
          data: data?.data.map((t) => (t.id === id ? result.data : t)) || [],
          total: data?.total || 0,
        };
      },
      {
        optimisticData: {
          data:
            data?.data.map((t) =>
              t.id === id
                ? {
                    ...t,
                    ...updates,
                    // Cast amount if present (client-side optimistic update)
                    ...(updates.amount !== undefined ? { amount: updates.amount as any } : {}),
                    // Preserve existing category/account data if not updating those fields
                    ...(updates.categoryId ? {} : { categoryId: t.categoryId }),
                    ...(updates.accountId ? {} : { accountId: t.accountId }),
                  }
                : t
            ) || [],
          total: data?.total || 0,
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  /**
   * Delete transaction with optimistic update
   */
  const deleteTransaction = async (id: string) => {
    await mutate(
      async () => {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to delete transaction');
        }

        return {
          data: data?.data.filter((t) => t.id !== id) || [],
          total: Math.max((data?.total || 1) - 1, 0),
        };
      },
      {
        optimisticData: {
          data: data?.data.filter((t) => t.id !== id) || [],
          total: Math.max((data?.total || 1) - 1, 0),
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  /**
   * Bulk delete transactions with optimistic update
   */
  const bulkDeleteTransactions = async (ids: string[]) => {
    await mutate(
      async () => {
        // Execute parallel DELETE calls
        const deletePromises = ids.map((id) =>
          fetch(`/api/transactions/${id}`, { method: 'DELETE' })
        );

        const responses = await Promise.all(deletePromises);

        // Check if any deletion failed
        const failedCount = responses.filter((res) => !res.ok).length;

        if (failedCount > 0) {
          throw new Error(`Failed to delete ${failedCount} transaction(s)`);
        }

        return {
          data: data?.data.filter((t) => !ids.includes(t.id)) || [],
          total: Math.max((data?.total || ids.length) - ids.length, 0),
        };
      },
      {
        optimisticData: {
          data: data?.data.filter((t) => !ids.includes(t.id)) || [],
          total: Math.max((data?.total || ids.length) - ids.length, 0),
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  /**
   * Bulk reassign category with optimistic update
   */
  const bulkReassignCategory = async (ids: string[], newCategoryId: string) => {
    await mutate(
      async () => {
        const response = await fetch('/api/transactions/bulk/reassign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, categoryId: newCategoryId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to reassign category');
        }

        // Revalidate to get updated category details
        return fetcher(apiUrl);
      },
      {
        optimisticData: {
          data:
            data?.data.map((t) => (ids.includes(t.id) ? { ...t, categoryId: newCategoryId } : t)) ||
            [],
          total: data?.total || 0,
        },
        rollbackOnError: true,
        populateCache: false, // Don't populate cache, let revalidate fetch fresh data
        revalidate: true, // Revalidate to get updated category name/color
      }
    );
  };

  return {
    transactions: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    bulkReassignCategory,
    mutate,
  };
}
