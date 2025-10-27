# TASK-BUDG-005 - Create Budget Form Component

## Context & Goal

**Business Value:** Enable budget creation UI (FR-048)  
**Epic:** EPIC-08 Budgets (Stretch - V1.1)  
**PRD Reference:** FR-048 (Create budget form)

## Scope Definition

**✅ In Scope:**

- Budget form dialog
- Category dropdown (expense only)
- Month picker
- Target amount input
- Form validation

**⛔ Out of Scope:**

- Recurring budgets (V2)

## Technical Specifications

```typescript
// /components/budgets/budget-form-dialog.tsx
export function BudgetFormDialog({ open, onOpenChange }) {
  const form = useForm({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      categoryId: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      targetAmount: 0,
    },
  });

  const onSubmit = async data => {
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Budget created!');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CategorySelect
            value={form.watch('categoryId')}
            onChange={id => form.setValue('categoryId', id)}
            type="expense"
          />
          <MonthPicker
            value={{ year: form.watch('year'), month: form.watch('month') }}
            onChange={({ year, month }) => {
              form.setValue('year', year);
              form.setValue('month', month);
            }}
          />
          <Input
            type="number"
            {...form.register('targetAmount', { valueAsNumber: true })}
            placeholder="Target amount"
          />
          <Button type="submit">Create Budget</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Acceptance Criteria

1. **Given** "+ Add Budget" clicked
   **When** form opens
   **Then** category dropdown shows only expense categories

2. **Given** month picker
   **When** selecting
   **Then** current month pre-selected

3. **Given** valid budget data
   **When** submitting
   **Then** POST to /api/budgets

## Definition of Done

- [ ] BudgetFormDialog created
- [ ] Category select (expense only)
- [ ] Month picker
- [ ] Target amount input
- [ ] Form validation
- [ ] API integration

## Dependencies

**Upstream:** TASK-BUDG-002, TASK-CAT-010  
**Effort:** 4 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
