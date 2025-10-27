# TASK-ACC-002 - Implement GET /api/accounts Endpoint with Balance Calculation

## Context & Goal

**Business Value:** Retrieve accounts with derived balances (FR-027, US-011)  
**Epic:** EPIC-05 Account Management  
**User Story:** US-ACC-02 - See derived account balances  
**PRD Reference:** FR-027 (Accounts list with balances), US-011

## Scope Definition

**✅ In Scope:**

- GET /api/accounts endpoint
- User scoping
- Balance calculation: sum(income) - sum(expense) per account
- Order by creation date

**⛔ Out of Scope:**

- Manual balance adjustments (V1.1)

## Technical Specifications

```typescript
// /app/api/accounts/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { txns: true } },
    },
  });

  // Calculate balance for each account
  const accountsWithBalances = await Promise.all(
    accounts.map(async account => {
      const transactions = await db.transaction.findMany({
        where: { accountId: account.id, userId: user.id },
        select: { amount: true, type: true },
      });

      const balance = transactions.reduce((sum, txn) => {
        return txn.type === 'income'
          ? sum + Number(txn.amount)
          : sum - Number(txn.amount);
      }, 0);

      return {
        ...account,
        balance,
      };
    })
  );

  return NextResponse.json({ data: accountsWithBalances });
}
```

## Acceptance Criteria

1. **Given** authenticated user
   **When** GET /api/accounts
   **Then** return all accounts with calculated balances

2. **Given** account with 2 income (€100 each), 1 expense (€50)
   **When** checking balance
   **Then** balance = €150 (100 + 100 - 50)

3. **Given** account with no transactions
   **When** checking balance
   **Then** balance = €0

4. **Given** accounts ordered
   **When** checking list
   **Then** sorted by createdAt ascending

## Definition of Done

- [ ] GET endpoint implemented
- [ ] User scoping enforced
- [ ] Balance calculation correct
- [ ] Transaction count included
- [ ] Ordered by creation date
- [ ] Integration tests with balance verification

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-ACC-001  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
