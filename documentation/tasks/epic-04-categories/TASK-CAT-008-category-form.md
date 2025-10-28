# TASK-CAT-008 - Create Category Form Component with Color Picker

## Context & Goal

**Business Value:** Enable custom category creation with color selection (FR-018, UX-005)  
**Epic:** EPIC-04 Category Management  
**User Story:** US-CAT-01 - Create custom categories with colors  
**PRD Reference:** FR-018, UX-005

## Scope Definition

**✅ In Scope:**

- Category form dialog
- Name input
- Type selector (expense/income)
- Color picker component
- Create and edit modes
- Form validation

**⛔ Out of Scope:**

- Category icons (V1.1)
- Category templates (V2)

## Technical Specifications

```typescript
// /components/categories/category-form-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema } from '@/lib/validators/category';
import { ColorPicker } from '@/components/ui/color-picker';
import { CategoryType } from '@prisma/client';

export function CategoryFormDialog({ open, onOpenChange, category, mode }) {
  const form = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: category || {
      name: '',
      color: '#22c55e',
      type: CategoryType.expense,
    },
  });

  const onSubmit = async data => {
    const url =
      mode === 'create' ? '/api/categories' : `/api/categories/${category.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success(
        mode === 'create' ? 'Category created!' : 'Category updated!'
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Category' : 'Edit Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  form.watch('type') === CategoryType.expense
                    ? 'default'
                    : 'outline'
                }
                onClick={() => form.setValue('type', CategoryType.expense)}
                disabled={mode === 'edit'}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={
                  form.watch('type') === CategoryType.income
                    ? 'default'
                    : 'outline'
                }
                onClick={() => form.setValue('type', CategoryType.income)}
                disabled={mode === 'edit'}
              >
                Income
              </Button>
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <ColorPicker
              value={form.watch('color')}
              onChange={color => form.setValue('color', color)}
            />
          </div>

          <Button type="submit" className="w-full">
            {mode === 'create' ? 'Create Category' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```typescript
// /components/ui/color-picker.tsx
'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const presetColors = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
];

export function ColorPicker({ value, onChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span
            className="h-4 w-4 rounded"
            style={{ backgroundColor: value }}
          />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-7 gap-2">
          {presetColors.map(color => (
            <button
              key={color}
              type="button"
              className="h-8 w-8 rounded border"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## Acceptance Criteria

1. **Given** "+ Add Category" clicked
   **When** form opens
   **Then** empty form with default color

2. **Given** color picker opened
   **When** selecting color
   **Then** form updates with selected color

3. **Given** valid category data
   **When** submitting
   **Then** POST to /api/categories

4. **Given** edit mode
   **When** viewing type field
   **Then** type toggle disabled (immutable)

## Definition of Done

- [x] CategoryFormDialog created (implemented as `CategoryDialog`)
- [x] ColorPicker component created (inline color picker with presets)
- [x] Name, type, color fields
- [x] Create and edit modes
- [x] Type immutable in edit mode
- [x] Form validation
- [x] API integration
- [x] Component tests created (22 tests covering all acceptance criteria)

## Dependencies

**Upstream:** TASK-FOUND-005 (Forms), TASK-CAT-003 (POST endpoint)  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
