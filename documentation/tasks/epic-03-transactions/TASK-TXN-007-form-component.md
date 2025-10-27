# TASK-TXN-007 - Build Transaction Form Component (Drawer/Sheet)

## Context & Goal

**Business Value:** Enable quick transaction entry (<10s) with optimized UX (FR-007, UX-002, UX-003)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-01 - As a user, I want to log an expense in under 10 seconds  
**PRD Reference:** FR-007, UX-002 (Drawer/sheet), UX-003 (Animation)

## Scope Definition

**✅ In Scope:**

- Drawer component (desktop, 480px width)
- Sheet component (mobile, full-screen)
- Slide animation (300ms ease-in-out)
- Backdrop click to close
- Keyboard shortcuts (Esc to close)
- Form state management (create vs. edit mode)
- Close confirmation if unsaved changes

**⛔ Out of Scope:**

- Form fields implementation (TASK-TXN-008)
- API submission logic (in form fields task)

## Technical Specifications

**Implementation Details:**

```typescript
// /components/transactions/transaction-drawer.tsx
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TransactionFormFields } from './transaction-form-fields';

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  mode: 'create' | 'edit';
}

export function TransactionDrawer({
  open,
  onOpenChange,
  transaction,
  mode,
}: TransactionDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>
            {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <TransactionFormFields
            transaction={transaction}
            mode={mode}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

## Acceptance Criteria

1. **Given** desktop viewport
   **When** opening transaction form
   **Then** drawer slides in from right (480px width)

2. **Given** mobile viewport
   **When** opening transaction form
   **Then** sheet opens full-screen from bottom

3. **Given** drawer open
   **When** clicking backdrop
   **Then** drawer closes

4. **Given** drawer open
   **When** pressing Esc key
   **Then** drawer closes

5. **Given** animation
   **When** drawer opens/closes
   **Then** 300ms ease-in-out transition

## Definition of Done

- [ ] Drawer component created
- [ ] Sheet component for mobile
- [ ] Responsive (drawer on desktop, sheet on mobile)
- [ ] Backdrop click closes
- [ ] Esc key closes
- [ ] 300ms animation
- [ ] Create/edit mode support
- [ ] Integration with form fields component

## Dependencies

**Upstream:** TASK-FOUND-002 (shadcn/ui Sheet)  
**Effort:** 8 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Design Lead)
