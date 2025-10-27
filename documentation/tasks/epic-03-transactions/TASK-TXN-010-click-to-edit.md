# TASK-TXN-010 - Implement Transaction Row Click-to-Edit Functionality

## Context & Goal

**Business Value:** Enable quick editing of transactions from list view (FR-010, US-002)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-02 - Edit transactions I logged incorrectly  
**PRD Reference:** FR-010 (Click row to edit)

## Scope Definition

**✅ In Scope:**

- Click handler on transaction rows
- Open drawer with pre-populated transaction data
- Edit mode for form
- Visual hover state on rows

**⛔ Out of Scope:**

- Inline editing (V1.1)
- Keyboard shortcuts for edit (V1.1)

## Technical Specifications

```typescript
// /components/transactions/transaction-row.tsx
'use client';

import { useState } from 'react';
import { TransactionDrawer } from './transaction-drawer';
import { formatCurrency } from '@/lib/chart-utils';

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setEditOpen(true)}
      >
        <td>{new Date(transaction.txnDate).toLocaleDateString('de-DE')}</td>
        <td className="font-medium">{formatCurrency(transaction.amount)}</td>
        <td>
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: transaction.category.color }}
            />
            {transaction.category.name}
          </span>
        </td>
        <td>{transaction.account.name}</td>
        <td className="truncate max-w-xs">{transaction.note}</td>
      </tr>

      <TransactionDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        transaction={transaction}
        mode="edit"
      />
    </>
  );
}
```

## Acceptance Criteria

1. **Given** transaction list
   **When** clicking transaction row
   **Then** edit drawer opens with transaction data pre-filled

2. **Given** hover over row
   **When** mouse over
   **Then** background changes to indicate clickable

3. **Given** edit drawer open
   **When** making changes and saving
   **Then** drawer closes and list updates

4. **Given** keyboard navigation
   **When** pressing Enter on focused row
   **Then** edit drawer opens

## Definition of Done

- [ ] TransactionRow component with click handler
- [ ] Hover state styling
- [ ] Opens drawer in edit mode
- [ ] Pre-populates form with transaction data
- [ ] Keyboard accessible (Enter key)
- [ ] Integration with TransactionDrawer

## Dependencies

**Upstream:** TASK-TXN-007 (Drawer), TASK-TXN-008 (Form fields), TASK-TXN-017 (List view)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
