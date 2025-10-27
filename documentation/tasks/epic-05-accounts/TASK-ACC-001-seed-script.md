# TASK-ACC-001 - Create Default Accounts Seed Script

## Context & Goal

**Business Value:** Provide default accounts (Cash, Card) for all users on signup (FR-026)  
**Epic:** EPIC-05 Account Management  
**PRD Reference:** FR-026 (Auto-create default accounts)

## Scope Definition

**✅ In Scope:**

- seedDefaultAccounts function
- 2 default accounts: "Cash" and "Card"
- Account colors per design tokens
- Reusable for AUTH-001 integration

**⛔ Out of Scope:**

- Custom account creation (ACC-003)

## Technical Specifications

```typescript
// /lib/seed/accounts.ts
import { PrismaClient } from '@prisma/client';

export const defaultAccounts = [
  { name: 'Cash', color: '#22c55e' },
  { name: 'Card', color: '#3b82f6' },
] as const;

export async function createDefaultAccounts(tx: PrismaClient, userId: string) {
  const accounts = await tx.account.createMany({
    data: defaultAccounts.map(acc => ({
      ...acc,
      userId,
    })),
  });

  console.log(
    `Created ${defaultAccounts.length} default accounts for user ${userId}`
  );

  return accounts;
}
```

## Acceptance Criteria

1. **Given** new user signup
   **When** seedDefaultAccounts called
   **Then** 2 accounts created (Cash, Card)

2. **Given** default accounts created
   **When** querying database
   **Then** accounts linked to userId

3. **Given** account colors
   **When** checking values
   **Then** match design tokens

## Definition of Done

- [ ] seedDefaultAccounts function created
- [ ] 2 default accounts defined
- [ ] Colors match PRD
- [ ] Function exported for AUTH-001
- [ ] Integration in signup flow

## Dependencies

**Upstream:** TASK-FOUND-003 (Database)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
