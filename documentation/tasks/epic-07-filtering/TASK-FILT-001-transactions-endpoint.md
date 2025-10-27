# TASK-FILT-001 - Implement GET /api/transactions with Query Parameters

## Context & Goal

**Business Value:** Enable filtering and searching of transactions (FR-036)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-036 (Filters update URL), API spec Section 8.2

## Scope Definition

**✅ In Scope:**

- GET /api/transactions endpoint
- Query parameters: from, to, accountId, categoryId, type, q (search)
- Pagination: skip, take
- User scoping
- Return transactions + total count

**⛔ Out of Scope:**

- Advanced filters (amount range, tags) - V1.1

## Technical Specifications

```typescript
// /app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { getTransactions } from '@/lib/queries/transactions';
import { transactionFiltersSchema } from '@/lib/validators/transaction';

export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);

  const filters = transactionFiltersSchema.parse({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    categoryId: searchParams.get('categoryId'),
    accountId: searchParams.get('accountId'),
    type: searchParams.get('type'),
    q: searchParams.get('q'),
  });

  const skip = parseInt(searchParams.get('skip') || '0');
  const take = parseInt(searchParams.get('take') || '50');

  const { transactions, total } = await getTransactions(user.id, filters, {
    skip,
    take,
    orderBy: { txnDate: 'desc' },
  });

  return NextResponse.json({
    data: transactions,
    total,
    page: Math.floor(skip / take) + 1,
    pageSize: take,
  });
}
```

## Acceptance Criteria

1. **Given** from and to parameters
   **When** GET /api/transactions?from=2025-10-01&to=2025-10-31
   **Then** return only October transactions

2. **Given** categoryId parameter
   **When** GET /api/transactions?categoryId=xxx
   **Then** return only that category's transactions

3. **Given** search query "grocery"
   **When** GET /api/transactions?q=grocery
   **Then** return transactions with "grocery" in note (case-insensitive)

4. **Given** skip=50, take=50
   **When** GET
   **Then** return page 2 (transactions 51-100)

5. **Given** multiple filters
   **When** GET /api/transactions?from=...&categoryId=...&type=expense
   **Then** return transactions matching ALL filters

## Definition of Done

- [ ] GET endpoint implemented
- [ ] All query parameters supported
- [ ] Pagination (skip/take)
- [ ] User scoping
- [ ] Integration with getTransactions helper
- [ ] Return total count for pagination
- [ ] Integration tests for all filter combinations

## Dependencies

**Upstream:** TASK-TXN-001 (Query helpers), TASK-AUTH-003  
**Effort:** 6 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
