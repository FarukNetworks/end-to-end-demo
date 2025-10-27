# TASK-TXN-017 - Create Transaction List View Component (Table/Cards)

## Context & Goal

**Business Value:** Display transactions in organized, scannable format with responsive design (FR-035, UX-015)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** FR-035 (Paginated list), UX-015 (Responsive table/cards)

## Scope Definition

**✅ In Scope:**

- Table layout for desktop
- Card layout for mobile
- Responsive breakpoints
- Transaction row components
- Color-coded categories
- Pagination controls
- Empty state

**⛔ Out of Scope:**

- Filtering (EPIC-07)
- Virtual scrolling (V1.1)

## Technical Specifications

```typescript
// /components/transactions/transaction-table.tsx
'use client';

import { TransactionRow } from './transaction-row';
import { TransactionCard } from './transaction-card';
import { useMediaQuery } from '@/hooks/use-media-query';

export function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add your first transaction to get started"
        action={{ label: '+ Add Transaction', onClick: () => {} }}
      />
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        {transactions.map(transaction => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Date</th>
          <th className="text-right p-2">Amount</th>
          <th className="text-left p-2">Category</th>
          <th className="text-left p-2">Account</th>
          <th className="text-left p-2">Note</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(transaction => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </tbody>
    </table>
  );
}
```

```typescript
// /components/transactions/transaction-card.tsx
export function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">
            {formatCurrency(transaction.amount)}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(transaction.txnDate).toLocaleDateString('de-DE')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: transaction.category.color }}
          />
          <span className="text-sm">{transaction.category.name}</span>
        </div>
      </div>
      {transaction.note && (
        <p className="text-sm text-muted-foreground">{transaction.note}</p>
      )}
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** desktop viewport
   **When** viewing transactions
   **Then** table layout with columns displayed

2. **Given** mobile viewport
   **When** viewing transactions
   **Then** card layout displayed

3. **Given** empty transaction list
   **When** rendering
   **Then** empty state with CTA shown

4. **Given** transaction list
   **When** scrolling
   **Then** responsive layout maintained

## Definition of Done

- [ ] Table component for desktop
- [ ] Card component for mobile
- [ ] Responsive breakpoint logic
- [ ] Category color indicators
- [ ] Empty state integration
- [ ] Accessible table markup

## Dependencies

**Upstream:** TASK-FOUND-002  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
