# TASK-TXN-008 - Implement Form Fields with Validation (Amount, Date, Category, Account)

## Context & Goal

**Business Value:** Provide user-friendly input fields with real-time validation for transaction entry (UX-004 to UX-007)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-01 - Log expense in <10 seconds  
**PRD Reference:** UX-004 (Form inputs), UX-005 (Category dropdown), UX-006 (Date picker), UX-007 (Amount input)

## Scope Definition

**✅ In Scope:**

- Amount input with EUR formatting
- Type toggle (expense/income)
- Date picker with presets (Today, Yesterday, 2 Days Ago)
- Category dropdown with color swatches
- Account dropdown
- Note textarea
- Tags input (comma-separated)
- Real-time validation on blur
- Form submission to API

**⛔ Out of Scope:**

- Recurring transaction fields (Stretch)
- Attachment upload (V1.1)

## Technical Specifications

**Implementation Details:**

```typescript
// /components/transactions/transaction-form-fields.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema } from '@/lib/validators/transaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelect } from '@/components/categories/category-select';
import { DatePicker } from '@/components/ui/date-picker';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import { TxnType } from '@prisma/client';

interface TransactionFormFieldsProps {
  transaction?: Transaction;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

export function TransactionFormFields({
  transaction,
  mode,
  onSuccess,
}: TransactionFormFieldsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: transaction || {
      amount: 0,
      type: TxnType.expense,
      txnDate: new Date(),
      categoryId: '',
      accountId: '',
      note: '',
      tags: [],
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const url =
        mode === 'create'
          ? '/api/transactions'
          : `/api/transactions/${transaction?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to save transaction');
      }

      toast.success(
        mode === 'create' ? 'Transaction added!' : 'Transaction updated!'
      );
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...form.register('amount', { valueAsNumber: true })}
          className="text-right"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {/* Type Toggle */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={
              form.watch('type') === TxnType.expense ? 'default' : 'outline'
            }
            onClick={() => form.setValue('type', TxnType.expense)}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={
              form.watch('type') === TxnType.income ? 'default' : 'outline'
            }
            onClick={() => form.setValue('type', TxnType.income)}
          >
            Income
          </Button>
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="txnDate">Date</Label>
        <DatePicker
          date={form.watch('txnDate')}
          onDateChange={date => form.setValue('txnDate', date)}
          presets={['today', 'yesterday', '2-days-ago']}
        />
      </div>

      {/* Category Select */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <CategorySelect
          value={form.watch('categoryId')}
          onChange={value => form.setValue('categoryId', value)}
          type={form.watch('type')}
        />
      </div>

      {/* Account Select */}
      <div className="space-y-2">
        <Label htmlFor="accountId">Account</Label>
        {/* Similar to CategorySelect */}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="Add a note..."
          {...form.register('note')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading
          ? 'Saving...'
          : mode === 'create'
          ? 'Add Transaction'
          : 'Save Changes'}
      </Button>
    </form>
  );
}
```

## Acceptance Criteria

1. **Given** form fields rendered
   **When** user types in amount field
   **Then** accepts decimal input (e.g., 45.50)

2. **Given** amount field on blur
   **When** user leaves field
   **Then** displays formatted EUR (€45.50)

3. **Given** expense type selected
   **When** category dropdown opens
   **Then** shows only expense categories

4. **Given** date picker
   **When** clicking "Today" preset
   **Then** date set to today and picker closes

5. **Given** invalid data (amount = 0)
   **When** submitting form
   **Then** validation error displays inline

## Definition of Done

- [ ] Transaction form fields component created
- [ ] Amount input with EUR formatting
- [ ] Type toggle (expense/income)
- [ ] Date picker with presets
- [ ] Category dropdown integration
- [ ] Account dropdown integration
- [ ] Note textarea
- [ ] Tags input (optional)
- [ ] Form validation with Zod
- [ ] API submission (create/edit)
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design

## Dependencies

**Upstream:** TASK-FOUND-005 (Forms), TASK-TXN-007 (Drawer), TASK-CAT-010 (Category dropdown)  
**Effort:** 6 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Design Lead)
