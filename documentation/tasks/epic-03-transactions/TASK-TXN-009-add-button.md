# TASK-TXN-009 - Create "+ Add Transaction" Floating Action Button

## Context & Goal

**Business Value:** Make transaction entry accessible from all pages for quick logging (UX-002)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** UX-002 (FAB accessible from all pages)

## Scope Definition

**✅ In Scope:**

- Floating Action Button (FAB) component
- Fixed position bottom-right on mobile
- Sticky header button on desktop
- Opens transaction drawer on click
- Global availability across protected pages

**⛔ Out of Scope:**

- Keyboard shortcut (N or Ctrl+K) - UX-017 deferred to V1.1
- Multiple FAB actions (V2)

## Technical Specifications

**Implementation Details:**

```typescript
// /components/transactions/add-transaction-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionDrawer } from './transaction-drawer';

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: Header button */}
      <Button onClick={() => setOpen(true)} className="hidden md:flex gap-2">
        <Plus className="h-4 w-4" />
        Add Transaction
      </Button>

      {/* Mobile: FAB */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Transaction</span>
      </Button>

      <TransactionDrawer open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
```

- Add to layout in `/app/(protected)/layout.tsx`:

```typescript
import { AddTransactionButton } from '@/components/transactions/add-transaction-button';

export default function ProtectedLayout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <AddTransactionButton />
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** mobile viewport
   **When** viewing any page
   **Then** circular FAB visible in bottom-right corner

2. **Given** desktop viewport
   **When** viewing any page
   **Then** rectangular button in header with icon + text

3. **Given** FAB clicked
   **When** on mobile
   **Then** transaction drawer opens

4. **Given** button accessible
   **When** navigating with keyboard
   **Then** button receives focus and activates with Enter/Space

5. **Given** drawer open
   **When** closing drawer
   **Then** FAB/button remains accessible

## Definition of Done

- [ ] AddTransactionButton component created
- [ ] FAB for mobile (circular, bottom-right)
- [ ] Header button for desktop (with text)
- [ ] Opens TransactionDrawer on click
- [ ] Added to protected layout
- [ ] Accessible from all protected pages
- [ ] Screen reader accessible
- [ ] Keyboard navigable

## Dependencies

**Upstream:** TASK-TXN-007 (TransactionDrawer), TASK-FOUND-002 (Button component)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Design Lead)
