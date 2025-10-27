# TASK-FILT-002 - Build Transactions List Page with Pagination

## Context & Goal

**Business Value:** Provide transaction list view with navigation (FR-035)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-035 (Paginated list), Navigation /transactions

## Scope Definition

**✅ In Scope:**

- /transactions page route
- Fetch transactions with pagination
- Pagination controls (prev/next, page numbers)
- 50 transactions per page
- Filters bar integration
- Transaction list integration

**⛔ Out of Scope:**

- Infinite scroll (V2)

## Technical Specifications

```typescript
// /app/transactions/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { FiltersBar } from '@/components/transactions/filters-bar';
import { Pagination } from '@/components/ui/pagination';

export default async function TransactionsPage({ searchParams }) {
  const user = await requireAuth();

  const page = parseInt(searchParams.page || '1');
  const skip = (page - 1) * 50;

  const queryParams = new URLSearchParams({
    ...searchParams,
    skip: skip.toString(),
    take: '50',
  });

  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/transactions?${queryParams}`,
    { headers: { cookie: req.headers.get('cookie') || '' } }
  );

  const { data: transactions, total } = await response.json();
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>

      <FiltersBar />

      <div className="mt-6">
        <TransactionTable transactions={transactions} />
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** /transactions page
   **When** loading
   **Then** first 50 transactions displayed

2. **Given** >50 transactions
   **When** viewing pagination
   **Then** next/prev buttons and page numbers shown

3. **Given** page 2 selected
   **When** navigating
   **Then** transactions 51-100 displayed

4. **Given** filters applied
   **When** paginating
   **Then** filters persist across pages

## Definition of Done

- [ ] /transactions page created
- [ ] Fetch transactions with pagination
- [ ] Pagination component
- [ ] 50 per page
- [ ] Filters integration
- [ ] URL params for page number

## Dependencies

**Upstream:** TASK-FILT-001 (GET endpoint), TASK-TXN-017 (Table)  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
