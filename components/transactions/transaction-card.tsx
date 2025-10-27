import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/chart-utils';
import type { TransactionWithRelations } from './transaction-row';

interface TransactionCardProps {
  transaction: TransactionWithRelations;
  isSelected: boolean;
  onToggleSelection: () => void;
  onClick: () => void;
}

/**
 * Mobile card view for a transaction
 * Displays transaction details in a compact card format with bulk selection support
 */
export function TransactionCard({
  transaction,
  isSelected,
  onToggleSelection,
  onClick,
}: TransactionCardProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="bg-card flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Edit transaction: ${formatCurrency(Number(transaction.amount))} for ${transaction.category.name}`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 pt-1" onClick={handleCheckboxClick}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
          aria-label={`Select transaction ${transaction.id}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Amount and Date */}
        <div className="flex items-start justify-between gap-2">
          <div className="text-lg font-semibold">{formatCurrency(Number(transaction.amount))}</div>
          <div className="whitespace-nowrap text-sm text-muted-foreground">
            {new Date(transaction.txnDate).toLocaleDateString('de-DE')}
          </div>
        </div>

        {/* Category and Account */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: transaction.category.color }}
              aria-hidden="true"
            />
            <span>{transaction.category.name}</span>
          </div>
          <div className="text-muted-foreground">{transaction.account.name}</div>
        </div>

        {/* Note */}
        {transaction.note && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{transaction.note}</p>
        )}
      </div>
    </div>
  );
}
