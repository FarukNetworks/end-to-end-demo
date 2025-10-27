# TASK-ACC-009 - Implement Account Balance Derivation Logic

## Context & Goal

**Business Value:** Calculate real-time account balances from transactions (US-011)  
**Epic:** EPIC-05 Account Management  
**User Story:** US-ACC-02 - See derived account balances  
**PRD Reference:** FR-027 (Derived balances), Section 4.4 (Balance is derived)

## Scope Definition

**✅ In Scope:**

- Balance calculation function
- Formula: sum(income) - sum(expense) per account
- Integration in GET /api/accounts
- Decimal precision (2 places)
- Performance optimization

**⛔ Out of Scope:**

- Stored balances (design decision: derived only)
- Balance history tracking (V2)

## Technical Specifications

```typescript
// /lib/queries/accounts.ts
import { db } from '@/lib/db';

export async function calculateAccountBalance(
  userId: string,
  accountId: string
): Promise<number> {
  const result = await db.transaction.groupBy({
    by: ['type'],
    where: {
      accountId,
      userId,
    },
    _sum: {
      amount: true,
    },
  });

  const income = result.find(r => r.type === 'income')?._sum.amount || 0;
  const expense = result.find(r => r.type === 'expense')?._sum.amount || 0;

  return Number(income) - Number(expense);
}

export async function getAccountsWithBalances(userId: string) {
  const accounts = await db.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  // Calculate balance for each account
  const accountsWithBalances = await Promise.all(
    accounts.map(async account => {
      const balance = await calculateAccountBalance(userId, account.id);
      return {
        ...account,
        balance: Number(balance.toFixed(2)),
      };
    })
  );

  return accountsWithBalances;
}
```

## Acceptance Criteria

1. **Given** account with €1000 income, €400 expense
   **When** calculating balance
   **Then** balance = €600.00

2. **Given** account with no transactions
   **When** calculating balance
   **Then** balance = €0.00

3. **Given** balance with many decimals
   **When** returning
   **Then** rounded to 2 decimal places

4. **Given** multiple accounts
   **When** GET /api/accounts
   **Then** each has correct derived balance

## Definition of Done

- [ ] calculateAccountBalance function created
- [ ] Integration in ACC-002 (GET endpoint)
- [ ] Decimal precision (2 places)
- [ ] Unit tests for calculation logic
- [ ] Integration tests with various scenarios

## Dependencies

**Upstream:** TASK-FOUND-003 (Database), TASK-ACC-002  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
