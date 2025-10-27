# TASK-TXN-016 - Add Optimistic UI Updates for Transaction CRUD

## Context & Goal

**Business Value:** Improve perceived performance by updating UI before API response (Performance enhancement)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** NF-003 (Transaction creation <500ms), User experience

## Scope Definition

**✅ In Scope:**

- Optimistic add to transaction list
- Optimistic update in list
- Optimistic delete from list
- Rollback on error
- React Query or SWR integration

**⛔ Out of Scope:**

- Complex conflict resolution (V2)

## Technical Specifications

```typescript
// Using SWR for client-side state
import useSWR from 'swr';

export function useTransactions(filters?: TransactionFilters) {
  const { data, error, mutate } = useSWR(
    ['/api/transactions', filters],
    fetcher
  );

  const addOptimistically = async (transaction: Transaction) => {
    // Optimistically add to local state
    await mutate(
      async () => {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          body: JSON.stringify(transaction),
        });

        if (!response.ok) throw new Error('Failed');

        return response.json();
      },
      {
        optimisticData: {
          data: [transaction, ...(data?.data || [])],
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return { transactions: data?.data, error, addOptimistically };
}
```

## Acceptance Criteria

1. **Given** create transaction
   **When** form submits
   **Then** transaction appears in list immediately (before API response)

2. **Given** API error after optimistic add
   **When** error occurs
   **Then** transaction removed from list (rollback)

3. **Given** delete transaction
   **When** confirmed
   **Then** transaction removed from UI immediately

4. **Given** update transaction
   **When** saving
   **Then** list updates immediately

## Definition of Done

- [ ] SWR or React Query installed
- [ ] Optimistic add implemented
- [ ] Optimistic update implemented
- [ ] Optimistic delete implemented
- [ ] Rollback on error
- [ ] Integration with existing transaction operations

## Dependencies

**Upstream:** TXN-002, TXN-003, TXN-004  
**Effort:** 6 SP  
**Priority:** P1 (Should-have)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
