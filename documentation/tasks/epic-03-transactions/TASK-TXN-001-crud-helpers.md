# TASK-TXN-001 - Create Transaction Prisma Model Queries (CRUD Helpers)

## Context & Goal

**Business Value:** Provide reusable database query functions for transactions with built-in user scoping  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** FR-007 to FR-015, NF-014 (User scoping)

## Scope Definition

**✅ In Scope:**

- Transaction query helper functions
- User scoping built into all queries
- Common query patterns (by date range, by category, by account)
- Type-safe Prisma queries
- Include related data (category, account)

**⛔ Out of Scope:**

- Complex analytics queries (handled in DASH endpoints)
- Caching layer (V1.1)
- Query optimization beyond indexing (performance tasks)

## Technical Specifications

**Implementation Details:**

- Create `/lib/queries/transactions.ts`:

  ```typescript
  import { db } from '@/lib/db';
  import { Prisma, TxnType } from '@prisma/client';

  export interface TransactionFilters {
    from?: Date;
    to?: Date;
    categoryId?: string;
    accountId?: string;
    type?: TxnType;
    search?: string;
  }

  export async function getTransactions(
    userId: string,
    filters?: TransactionFilters,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.TransactionOrderByWithRelationInput;
    }
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters?.from && { txnDate: { gte: filters.from } }),
      ...(filters?.to && { txnDate: { lte: filters.to } }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.accountId && { accountId: filters.accountId }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.search && {
        note: { contains: filters.search, mode: 'insensitive' },
      }),
    };

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          category: {
            select: { name: true, color: true, type: true },
          },
          account: {
            select: { name: true },
          },
        },
        orderBy: options?.orderBy || { txnDate: 'desc' },
        skip: options?.skip,
        take: options?.take,
      }),
      db.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  export async function getTransaction(userId: string, id: string) {
    return db.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        account: true,
      },
    });
  }

  export async function createTransaction(
    userId: string,
    data: Omit<
      Prisma.TransactionCreateInput,
      'user' | 'category' | 'account'
    > & {
      categoryId: string;
      accountId: string;
    }
  ) {
    return db.transaction.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        category: { connect: { id: data.categoryId } },
        account: { connect: { id: data.accountId } },
      },
      include: {
        category: { select: { name: true, color: true } },
        account: { select: { name: true } },
      },
    });
  }

  export async function updateTransaction(
    userId: string,
    id: string,
    data: Prisma.TransactionUpdateInput
  ) {
    // Use updateMany to ensure userId check
    const result = await db.transaction.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return getTransaction(userId, id);
  }

  export async function deleteTransaction(userId: string, id: string) {
    const result = await db.transaction.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }

  export async function bulkReassignCategory(
    userId: string,
    transactionIds: string[],
    newCategoryId: string
  ) {
    const result = await db.transaction.updateMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
      data: {
        categoryId: newCategoryId,
      },
    });

    return result.count;
  }

  export async function bulkDeleteTransactions(
    userId: string,
    transactionIds: string[]
  ) {
    const result = await db.transaction.deleteMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
    });

    return result.count;
  }
  ```

**Architecture References:**

- Prisma queries: https://www.prisma.io/docs/concepts/components/prisma-client/crud
- PRD NF-014: User scoping requirements

## Acceptance Criteria

1. **Given** userId and filters
   **When** calling getTransactions()
   **Then** only transactions for that user returned with correct filters

2. **Given** transaction belonging to user1
   **When** user2 calls getTransaction(user2.id, transaction.id)
   **Then** return null (not found)

3. **Given** updateTransaction with user2 ID
   **When** trying to update user1's transaction
   **Then** return null (no rows updated)

4. **Given** bulkDeleteTransactions with mixed ownership IDs
   **When** deleting
   **Then** only current user's transactions deleted

5. **Given** all query helpers
   **When** code review
   **Then** 100% include userId in WHERE clause

## Definition of Done

- [ ] Transaction query helpers created
- [ ] All helpers enforce user scoping
- [ ] getTransactions supports all filters
- [ ] CRUD helpers (create, update, delete) implemented
- [ ] Bulk operation helpers implemented
- [ ] Include related data (category, account)
- [ ] TypeScript types for all functions
- [ ] Unit tests for each helper (>90% coverage)
- [ ] Integration tests for user scoping
- [ ] Security test: cross-user access fails
- [ ] Documentation with usage examples

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-003 (Database + Prisma)
- TASK-AUTH-003 (requireApiAuth)
- TASK-AUTH-008 (User scoping pattern)

**External Dependencies:** Prisma  
**Parallel Tasks:** TXN-002 to TXN-017  
**Downstream Impact:** All transaction endpoints use these helpers

## Resources & References

**Design Assets:** N/A (database helpers)  
**Technical Docs:**

- Prisma CRUD: https://www.prisma.io/docs/concepts/components/prisma-client/crud

**PRD References:** FR-007 to FR-015, NF-014  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- Query helpers: 2-3 hours
- Bulk operations: 1 hour
- Testing: 1-2 hours

**Priority:** P0 (Must-have - used by all transaction endpoints)  
**Risk Level:** Medium (security-critical)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead - security review)  
**QA Owner:** TBD (Security testing)  
**Stakeholder:** Engineering Lead
