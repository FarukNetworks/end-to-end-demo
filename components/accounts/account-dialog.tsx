'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccountSchema } from '@/lib/validators/account';
import { toast } from '@/lib/toast';
import type { Account } from '@prisma/client';

type AccountWithBalance = Account & {
  _count: { txns: number };
  balance: number;
};

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountWithBalance;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

export function AccountDialog({
  open,
  onOpenChange,
  account,
  mode,
  onSuccess,
}: AccountDialogProps) {
  const form = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      color: '#6b7280',
    },
  });

  // Initialize form when dialog opens or account changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && account) {
        form.reset({
          name: account.name,
          color: account.color,
        });
      } else {
        form.reset({
          name: '',
          color: '#6b7280',
        });
      }
    }
  }, [open, mode, account, form]);

  const onSubmit = async (data: { name: string; color?: string }) => {
    try {
      const url = mode === 'edit' && account ? `/api/accounts/${account.id}` : '/api/accounts';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error?.message || `Failed to ${mode} account`);
      }

      toast.success(`Account ${mode === 'edit' ? 'updated' : 'created'}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} account`);
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const color = form.watch('color');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Account' : 'Edit Account'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="e.g., Checking Account"
              disabled={isSubmitting}
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                value={color || '#6b7280'}
                onChange={(e) => form.setValue('color', e.target.value)}
                disabled={isSubmitting}
                className="h-10 w-20 cursor-pointer rounded border"
              />
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => form.setValue('color', c)}
                    className="h-6 w-6 rounded-full border-2 border-transparent hover:border-foreground focus:border-foreground"
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
            {form.formState.errors.color && (
              <p className="text-sm text-red-500">{form.formState.errors.color.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
