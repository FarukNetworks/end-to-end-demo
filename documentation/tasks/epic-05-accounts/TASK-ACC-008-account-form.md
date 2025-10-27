# TASK-ACC-008 - Create Account Form Component

## Context & Goal

**Business Value:** Enable account creation and editing with color selection (FR-028, FR-031)  
**Epic:** EPIC-05 Account Management  
**PRD Reference:** FR-028 (Create form), FR-031 (Edit form)

## Scope Definition

**✅ In Scope:**

- Account form dialog
- Name input
- Color picker
- Create and edit modes
- Form validation

**⛔ Out of Scope:**

- Initial balance field (V1.1)

## Technical Specifications

```typescript
// /components/accounts/account-form-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccountSchema } from '@/lib/validators/account';
import { ColorPicker } from '@/components/ui/color-picker';

export function AccountFormDialog({ open, onOpenChange, account, mode }) {
  const form = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: account || {
      name: '',
      color: '#6b7280',
    },
  });

  const onSubmit = async data => {
    const url =
      mode === 'create' ? '/api/accounts' : `/api/accounts/${account.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success(
        mode === 'create' ? 'Account created!' : 'Account updated!'
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Account' : 'Edit Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              {...form.register('name')}
              placeholder="e.g., Business Card"
            />
          </div>

          <div>
            <Label>Color</Label>
            <ColorPicker
              value={form.watch('color')}
              onChange={color => form.setValue('color', color)}
            />
          </div>

          <Button type="submit" className="w-full">
            {mode === 'create' ? 'Create Account' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Acceptance Criteria

1. **Given** "+ Add Account" clicked
   **When** form opens
   **Then** empty form with default color

2. **Given** valid account data
   **When** submitting
   **Then** POST to /api/accounts

3. **Given** edit mode
   **When** opening
   **Then** form pre-filled with account data

## Definition of Done

- [ ] AccountFormDialog created
- [ ] Name and color fields
- [ ] ColorPicker integration
- [ ] Create/edit modes
- [ ] Form validation
- [ ] API integration

## Dependencies

**Upstream:** TASK-FOUND-005 (Forms), TASK-ACC-003 (POST endpoint), Color picker from CAT-008  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
