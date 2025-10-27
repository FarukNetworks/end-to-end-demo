# TASK-ACC-007 - Build Accounts Page with List View and Balances

## Context & Goal

**Business Value:** Provide account management interface with balance visibility (FR-027, US-011)  
**Epic:** EPIC-05 Account Management  
**User Story:** US-ACC-01, US-ACC-02 - Track accounts and see balances  
**PRD Reference:** FR-027 (Accounts list), Navigation /accounts

## Scope Definition

**✅ In Scope:**

- /accounts page route
- List view with name, color, balance, actions
- "+ Add Account" button
- Balance display formatted as EUR
- Edit and Delete buttons

**⛔ Out of Scope:**

- Account analytics (V2)

## Technical Specifications

```typescript
// /app/accounts/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { AccountList } from '@/components/accounts/account-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata = {
  title: 'Accounts - BudgetBuddy',
};

export default async function AccountsPage() {
  const user = await requireAuth();

  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/accounts`, {
    headers: { cookie: req.headers.get('cookie') || '' },
  });

  const { data: accounts } = await response.json();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <AccountList accounts={accounts} />
    </div>
  );
}
```

```typescript
// /components/accounts/account-list.tsx
import { formatCurrency } from '@/lib/chart-utils';

export function AccountList({ accounts }) {
  return (
    <div className="space-y-3">
      {accounts.map(account => (
        <div
          key={account.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-6 w-6 rounded"
              style={{ backgroundColor: account.color }}
            />
            <div>
              <div className="font-medium">{account.name}</div>
              <div className="text-sm text-muted-foreground">
                {account._count.txns} transaction(s)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold">
                {formatCurrency(account.balance)}
              </div>
              <div className="text-xs text-muted-foreground">Balance</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** /accounts page
   **When** loading
   **Then** all accounts displayed with balances

2. **Given** account with balance
   **When** viewing
   **Then** balance formatted as EUR (€1,234.56)

3. **Given** color swatch
   **When** viewing
   **Then** displays account.color

4. **Given** "+ Add Account" clicked
   **When** clicking
   **Then** account form opens

## Definition of Done

- [ ] /accounts page created
- [ ] Server-side data fetching
- [ ] AccountList component
- [ ] Balance display
- [ ] Color swatches
- [ ] Edit/Delete buttons
- [ ] "+ Add Account" button

## Dependencies

**Upstream:** TASK-ACC-002 (GET endpoint)  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
