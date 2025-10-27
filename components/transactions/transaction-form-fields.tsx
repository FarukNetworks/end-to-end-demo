'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Transaction, CategoryType } from '@prisma/client';
import { TxnType } from '@prisma/client';

import { createTransactionSchema } from '@/lib/validators/transaction';
import type { CreateTransactionInput } from '@/lib/validators/transaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelect } from '@/components/categories/category-select';
import { AccountSelect } from '@/components/accounts/account-select';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/lib/toast';
import { DeleteTransactionDialog } from './delete-transaction-dialog';
import { useTransactions } from '@/hooks/use-transactions';

type TransactionWithRelations = Transaction & {
  category: { name: string; color: string; type: CategoryType };
  account: { name: string };
};

interface TransactionFormFieldsProps {
  transaction?: TransactionWithRelations;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function TransactionFormFields({
  transaction,
  mode,
  onSuccess,
  onDirtyChange,
}: TransactionFormFieldsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use optimistic updates hook
  const { addTransaction, updateTransaction } = useTransactions();

  const form = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: transaction
      ? {
          amount: Number(transaction.amount),
          type: transaction.type as TxnType,
          txnDate: new Date(transaction.txnDate),
          categoryId: transaction.categoryId,
          accountId: transaction.accountId,
          note: transaction.note || '',
          tags: transaction.tags || [],
        }
      : {
          amount: 0,
          type: TxnType.expense,
          txnDate: new Date(),
          categoryId: '',
          accountId: '',
          note: '',
          tags: [],
        },
  });

  // Track dirty state for unsaved changes warning
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(form.formState.isDirty);
    }
  }, [form.formState.isDirty, onDirtyChange]);

  // Initialize amount display
  useEffect(() => {
    const amount = form.watch('amount');
    if (amount > 0) {
      setAmountDisplay(amount.toString());
    }
  }, [form]);

  const onSubmit = async (data: CreateTransactionInput) => {
    setIsLoading(true);

    try {
      if (mode === 'create') {
        await addTransaction(data);
        toast.success('Transaction added!');
      } else if (transaction) {
        await updateTransaction(transaction.id, data);
        toast.success('Transaction updated!');
      }

      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format amount as EUR on blur
  const handleAmountBlur = () => {
    const amount = form.getValues('amount');
    if (amount > 0) {
      setAmountDisplay(`€${amount.toFixed(2)}`);
    }
  };

  // Show plain number on focus
  const handleAmountFocus = () => {
    const amount = form.getValues('amount');
    if (amount > 0) {
      setAmountDisplay(amount.toString());
    }
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountDisplay(value);

    // Parse the numeric value
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue)) {
      form.setValue('amount', numericValue, { shouldValidate: true, shouldDirty: true });
    }
  };

  // Handle tags input (comma-separated)
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const tagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    form.setValue('tags', tagsArray, { shouldValidate: true, shouldDirty: true });
  };

  const tagsValue = form.watch('tags')?.join(', ') || '';
  const currentType = form.watch('type');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="text"
          placeholder="0.00"
          value={amountDisplay}
          onChange={handleAmountChange}
          onFocus={handleAmountFocus}
          onBlur={handleAmountBlur}
          className="text-right"
          aria-invalid={!!form.formState.errors.amount}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      {/* Type Toggle */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={currentType === TxnType.expense ? 'default' : 'outline'}
            onClick={() => form.setValue('type', TxnType.expense, { shouldDirty: true })}
            className="flex-1"
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={currentType === TxnType.income ? 'default' : 'outline'}
            onClick={() => form.setValue('type', TxnType.income, { shouldDirty: true })}
            className="flex-1"
          >
            Income
          </Button>
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="txnDate">Date</Label>
        <DatePicker
          date={form.watch('txnDate') as Date}
          onDateChange={(date) => form.setValue('txnDate', date, { shouldDirty: true })}
          presets={['today', 'yesterday', '2-days-ago']}
        />
        {form.formState.errors.txnDate && (
          <p className="text-sm text-destructive">{form.formState.errors.txnDate.message}</p>
        )}
      </div>

      {/* Category Select */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <CategorySelect
          value={form.watch('categoryId')}
          onChange={(value) => form.setValue('categoryId', value, { shouldDirty: true })}
          type={currentType}
        />
        {form.formState.errors.categoryId && (
          <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
        )}
      </div>

      {/* Account Select */}
      <div className="space-y-2">
        <Label htmlFor="accountId">Account</Label>
        <AccountSelect
          value={form.watch('accountId')}
          onChange={(value) => form.setValue('accountId', value, { shouldDirty: true })}
        />
        {form.formState.errors.accountId && (
          <p className="text-sm text-destructive">{form.formState.errors.accountId.message}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" placeholder="Add a note..." {...form.register('note')} rows={3} />
        {form.formState.errors.note && (
          <p className="text-sm text-destructive">{form.formState.errors.note.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (optional)</Label>
        <Input
          id="tags"
          type="text"
          placeholder="e.g., groceries, weekly, essential"
          value={tagsValue}
          onChange={handleTagsChange}
        />
        <p className="text-xs text-muted-foreground">Separate tags with commas (max 10)</p>
        {form.formState.errors.tags && (
          <p className="text-sm text-destructive">{form.formState.errors.tags.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : mode === 'create' ? 'Add Transaction' : 'Save Changes'}
      </Button>

      {/* Delete Button (Edit Mode Only) */}
      {mode === 'edit' && transaction && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
          >
            Delete Transaction
          </Button>

          <DeleteTransactionDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            transaction={transaction}
            onDeleted={onSuccess}
          />
        </>
      )}
    </form>
  );
}
