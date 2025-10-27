import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for displaying when no data is available
 *
 * @example Basic usage
 * ```tsx
 * <EmptyState
 *   title="No transactions found"
 *   description="Start by adding your first transaction"
 * />
 * ```
 *
 * @example With icon and action
 * ```tsx
 * <EmptyState
 *   title="No transactions found"
 *   description="Start by adding your first transaction"
 *   icon={<FileIcon className="h-12 w-12" />}
 *   action={{
 *     label: "Add Transaction",
 *     onClick: () => openModal()
 *   }}
 * />
 * ```
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
