# TASK-TXN-012 - Implement Bulk Transaction Selection (Checkboxes)

## Context & Goal

**Business Value:** Enable multi-select for bulk operations (FR-014, FR-015)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** FR-014 (Bulk delete), FR-015 (Bulk reassign)

## Scope Definition

**✅ In Scope:**

- Checkbox column in transaction table
- Select all checkbox in header
- Individual row checkboxes
- Selected state management
- Bulk action toolbar (appears when ≥1 selected)
- Clear selection action

**⛔ Out of Scope:**

- Bulk actions implementation (TASK-TXN-013, TXN-014)

## Technical Specifications

```typescript
// /components/transactions/transaction-list.tsx
'use client';

import { useState } from 'react';
import { TransactionRow } from './transaction-row';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { Checkbox } from '@/components/ui/checkbox';

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div>
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onClearSelection={clearSelection}
        />
      )}

      <table>
        <thead>
          <tr>
            <th className="w-12">
              <Checkbox
                checked={selectedIds.length === transactions.length}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all transactions"
              />
            </th>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Account</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>
                <Checkbox
                  checked={selectedIds.includes(transaction.id)}
                  onCheckedChange={() => toggleSelection(transaction.id)}
                  aria-label={`Select transaction ${transaction.id}`}
                />
              </td>
              <TransactionRow transaction={transaction} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** transaction list
   **When** rendering
   **Then** checkbox column appears in first column

2. **Given** individual checkbox clicked
   **When** checking
   **Then** row selected and added to selectedIds

3. **Given** select all checkbox clicked
   **When** all unchecked
   **Then** all rows selected

4. **Given** ≥1 transaction selected
   **When** checking UI
   **Then** bulk actions toolbar appears

5. **Given** transactions selected
   **When** clicking clear selection
   **Then** all checkboxes unchecked

## Definition of Done

- [ ] Checkbox column added to table
- [ ] Individual row checkboxes
- [ ] Select all checkbox in header
- [ ] Selected state management
- [ ] Bulk actions toolbar integration
- [ ] Clear selection functionality
- [ ] Accessible (ARIA labels)

## Dependencies

**Upstream:** TASK-FOUND-002 (Checkbox), TASK-TXN-017 (List view)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
