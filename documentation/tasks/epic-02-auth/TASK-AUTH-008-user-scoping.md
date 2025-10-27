# TASK-AUTH-008 - Implement User Scoping Enforcement on All Queries

## Context & Goal

**Business Value:** Ensure data isolation and prevent unauthorized access to other users' data (NF-014)  
**Epic:** EPIC-02 Authentication & User Management  
**PRD Reference:** NF-014 (User scoping on all queries), Section 12 (Security)

## Scope Definition

**✅ In Scope:**

- Database query helper functions with automatic user scoping
- Prisma middleware for user scoping enforcement
- Query patterns and examples
- Code review checklist for user scoping
- Security testing for cross-user access
- Documentation of scoping patterns

**⛔ Out of Scope:**

- Row-level security in PostgreSQL (V2)
- Multi-tenancy features (V2)
- Admin access patterns (V1.1)

## Technical Specifications

**Implementation Details:**

- Create scoped query helpers in `/lib/db-helpers.ts`:

  ```typescript
  import { db } from '@/lib/db';
  import { Prisma } from '@prisma/client';

  export function createScopedQueries(userId: string) {
    return {
      // Transactions
      transactions: {
        findMany: (args?: Omit<Prisma.TransactionFindManyArgs, 'where'>) =>
          db.transaction.findMany({
            ...args,
            where: { ...args?.where, userId },
          }),

        findUnique: (id: string) =>
          db.transaction.findFirst({
            where: { id, userId },
          }),

        create: (data: Omit<Prisma.TransactionCreateInput, 'user'>) =>
          db.transaction.create({
            data: {
              ...data,
              user: { connect: { id: userId } },
            },
          }),

        update: (id: string, data: Prisma.TransactionUpdateInput) =>
          db.transaction.updateMany({
            where: { id, userId },
            data,
          }),

        delete: (id: string) =>
          db.transaction.deleteMany({
            where: { id, userId },
          }),
      },

      // Categories
      categories: {
        findMany: (args?: Omit<Prisma.CategoryFindManyArgs, 'where'>) =>
          db.category.findMany({
            ...args,
            where: { ...args?.where, userId },
          }),

        findUnique: (id: string) =>
          db.category.findFirst({
            where: { id, userId },
          }),

        create: (data: Omit<Prisma.CategoryCreateInput, 'user'>) =>
          db.category.create({
            data: {
              ...data,
              user: { connect: { id: userId } },
            },
          }),

        update: (id: string, data: Prisma.CategoryUpdateInput) =>
          db.category.updateMany({
            where: { id, userId },
            data,
          }),

        delete: (id: string) =>
          db.category.deleteMany({
            where: { id, userId },
          }),
      },

      // Accounts
      accounts: {
        findMany: (args?: Omit<Prisma.AccountFindManyArgs, 'where'>) =>
          db.account.findMany({
            ...args,
            where: { ...args?.where, userId },
          }),

        findUnique: (id: string) =>
          db.account.findFirst({
            where: { id, userId },
          }),

        create: (data: Omit<Prisma.AccountCreateInput, 'user'>) =>
          db.account.create({
            data: {
              ...data,
              user: { connect: { id: userId } },
            },
          }),

        update: (id: string, data: Prisma.AccountUpdateInput) =>
          db.account.updateMany({
            where: { id, userId },
            data,
          }),

        delete: (id: string) =>
          db.account.deleteMany({
            where: { id, userId },
          }),
      },

      // Budgets
      budgets: {
        findMany: (args?: Omit<Prisma.BudgetFindManyArgs, 'where'>) =>
          db.budget.findMany({
            ...args,
            where: { ...args?.where, userId },
          }),

        create: (data: Omit<Prisma.BudgetCreateInput, 'user'>) =>
          db.budget.create({
            data: {
              ...data,
              user: { connect: { id: userId } },
            },
          }),
      },
    };
  }
  ```

- Create security testing utility in `/tests/utils/security-test-helpers.ts`:

  ```typescript
  import { db } from '@/lib/db';

  export async function createTestUsers() {
    const user1 = await db.user.create({
      data: {
        email: 'user1@test.com',
        passwordHash: 'hash1',
        name: 'User 1',
      },
    });

    const user2 = await db.user.create({
      data: {
        email: 'user2@test.com',
        passwordHash: 'hash2',
        name: 'User 2',
      },
    });

    return { user1, user2 };
  }

  export async function testCrossUserAccess(
    query: () => Promise<any>,
    shouldSucceed: boolean
  ) {
    try {
      const result = await query();
      if (!shouldSucceed && result) {
        throw new Error('Cross-user access violation: query returned data');
      }
      return result;
    } catch (error) {
      if (shouldSucceed) {
        throw error;
      }
    }
  }
  ```

- Example usage in API route:

  ```typescript
  import { requireApiAuth } from '@/lib/api-auth';
  import { createScopedQueries } from '@/lib/db-helpers';

  export async function GET(req: Request) {
    const { error, user } = await requireApiAuth();
    if (error) return error;

    const scoped = createScopedQueries(user.id);

    // This automatically scopes to user.id
    const transactions = await scoped.transactions.findMany({
      orderBy: { txnDate: 'desc' },
      take: 50,
    });

    return NextResponse.json({ data: transactions });
  }
  ```

- Create code review checklist in `/docs/SECURITY-REVIEW.md`:

  ```markdown
  # Security Review Checklist

  ## User Scoping

  - [ ] All database queries include userId filter
  - [ ] OR use createScopedQueries() helper
  - [ ] No raw SQL without userId
  - [ ] Foreign key checks (category, account belong to user)
  - [ ] Update/Delete use updateMany/deleteMany with userId
  ```

**Architecture References:**

- PRD NF-014: User scoping enforcement
- OWASP: https://owasp.org/www-project-top-ten/

## Acceptance Criteria

1. **Given** user1 creates transaction
   **When** user2 queries transactions
   **Then** user2 does not see user1's transaction

2. **Given** user1 transaction ID
   **When** user2 attempts PATCH /api/transactions/:id
   **Then** return 404 or 0 rows updated

3. **Given** scoped query helper
   **When** calling scoped.transactions.findMany()
   **Then** only current user's transactions returned

4. **Given** all API endpoints
   **When** security audit performed
   **Then** 100% of queries include userId filter

5. **Given** integration tests
   **When** testing cross-user access
   **Then** all tests pass (no data leakage)

## Definition of Done

- [ ] createScopedQueries helper created
- [ ] All CRUD operations support user scoping
- [ ] Security testing helpers created
- [ ] All existing API endpoints use scoped queries
- [ ] Code review checklist created
- [ ] Security audit completed (100% scoping coverage)
- [ ] Integration tests for cross-user access scenarios
- [ ] Documentation updated with scoping patterns
- [ ] No cross-user data leakage in tests

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-003 (Database + Prisma)
- TASK-AUTH-003 (requireApiAuth helper)

**External Dependencies:** Prisma  
**Parallel Tasks:** All API endpoint tasks  
**Downstream Impact:** ALL API endpoints use this pattern

## Resources & References

**Design Assets:** N/A (security infrastructure)  
**Technical Docs:**

- Prisma Middleware: https://www.prisma.io/docs/concepts/components/prisma-client/middleware

**PRD References:** NF-014, Section 12 (Security)  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 6 story points (8-10 hours)

- Scoped query helpers: 3 hours
- Security testing utilities: 2 hours
- Audit of existing queries: 2 hours
- Integration tests: 2-3 hours

**Priority:** P0 (Must-have - critical security)  
**Risk Level:** High (security implications)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead + Security review)  
**QA Owner:** TBD (Security penetration testing)  
**Stakeholder:** Engineering Lead
