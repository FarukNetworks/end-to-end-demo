import type { Transaction, CategoryType } from '@prisma/client';
import { formatCurrency } from '@/lib/chart-utils';

export type TransactionWithRelations = Transaction & {
  category: { name: string; color: string; type: CategoryType };
  account: { name: string };
};

interface TransactionRowProps {
  transaction: TransactionWithRelations;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  return (
    <>
      <td className="p-2">{new Date(transaction.txnDate).toLocaleDateString('de-DE')}</td>
      <td className="p-2 text-right font-medium">{formatCurrency(Number(transaction.amount))}</td>
      <td className="p-2">
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: transaction.category.color }}
            aria-hidden="true"
          />
          {transaction.category.name}
        </span>
      </td>
      <td className="p-2">{transaction.account.name}</td>
      <td className="max-w-xs truncate p-2">{transaction.note || '—'}</td>
    </>
  );
}
