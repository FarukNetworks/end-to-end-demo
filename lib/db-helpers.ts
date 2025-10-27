import { db } from '@/lib/db';

/**
 * Creates scoped database query helpers that automatically enforce user isolation.
 * All queries are scoped to the provided userId to prevent cross-user data access.
 *
 * @param userId - The user ID to scope all queries to
 * @returns Object with scoped query methods for all user-owned resources
 *
 * @example
 * ```typescript
 * const scoped = createScopedQueries(user.id);
 * const transactions = await scoped.transactions.findMany({ take: 10 });
 * ```
 */
export function createScopedQueries(userId: string) {
  return {
    // Transactions
    transactions: {
      /**
       * Find many transactions for the current user
       */
      findMany: (args?: any) =>
        db.transaction.findMany({
          ...args,
          where: { ...args?.where, userId },
        }),

      /**
       * Find a unique transaction by ID (scoped to current user)
       * Returns null if transaction doesn't exist or belongs to another user
       */
      findUnique: (id: string) =>
        db.transaction.findFirst({
          where: { id, userId },
        }),

      /**
       * Create a transaction for the current user
       */
      create: (data: any) =>
        db.transaction.create({
          data: {
            ...data,
            user: { connect: { id: userId } },
          },
        }),

      /**
       * Update a transaction (only if it belongs to current user)
       * Returns { count: 0 } if transaction doesn't exist or belongs to another user
       */
      update: (id: string, data: any) =>
        db.transaction.updateMany({
          where: { id, userId },
          data,
        }),

      /**
       * Delete a transaction (only if it belongs to current user)
       * Returns { count: 0 } if transaction doesn't exist or belongs to another user
       */
      delete: (id: string) =>
        db.transaction.deleteMany({
          where: { id, userId },
        }),

      /**
       * Count transactions for the current user
       */
      count: (args?: any) =>
        db.transaction.count({
          ...args,
          where: { ...args?.where, userId },
        }),
    },

    // Categories
    categories: {
      /**
       * Find many categories for the current user
       */
      findMany: (args?: any) =>
        db.category.findMany({
          ...args,
          where: { ...args?.where, userId },
        }),

      /**
       * Find a unique category by ID (scoped to current user)
       * Returns null if category doesn't exist or belongs to another user
       */
      findUnique: (id: string) =>
        db.category.findFirst({
          where: { id, userId },
        }),

      /**
       * Create a category for the current user
       */
      create: (data: any) =>
        db.category.create({
          data: {
            ...data,
            user: { connect: { id: userId } },
          },
        }),

      /**
       * Update a category (only if it belongs to current user)
       * Returns { count: 0 } if category doesn't exist or belongs to another user
       */
      update: (id: string, data: any) =>
        db.category.updateMany({
          where: { id, userId },
          data,
        }),

      /**
       * Delete a category (only if it belongs to current user)
       * Returns { count: 0 } if category doesn't exist or belongs to another user
       */
      delete: (id: string) =>
        db.category.deleteMany({
          where: { id, userId },
        }),

      /**
       * Count categories for the current user
       */
      count: (args?: any) =>
        db.category.count({
          ...args,
          where: { ...args?.where, userId },
        }),
    },

    // Accounts
    accounts: {
      /**
       * Find many accounts for the current user
       */
      findMany: (args?: any) =>
        db.account.findMany({
          ...args,
          where: { ...args?.where, userId },
        }),

      /**
       * Find a unique account by ID (scoped to current user)
       * Returns null if account doesn't exist or belongs to another user
       */
      findUnique: (id: string) =>
        db.account.findFirst({
          where: { id, userId },
        }),

      /**
       * Create an account for the current user
       */
      create: (data: any) =>
        db.account.create({
          data: {
            ...data,
            user: { connect: { id: userId } },
          },
        }),

      /**
       * Update an account (only if it belongs to current user)
       * Returns { count: 0 } if account doesn't exist or belongs to another user
       */
      update: (id: string, data: any) =>
        db.account.updateMany({
          where: { id, userId },
          data,
        }),

      /**
       * Delete an account (only if it belongs to current user)
       * Returns { count: 0 } if account doesn't exist or belongs to another user
       */
      delete: (id: string) =>
        db.account.deleteMany({
          where: { id, userId },
        }),

      /**
       * Count accounts for the current user
       */
      count: (args?: any) =>
        db.account.count({
          ...args,
          where: { ...args?.where, userId },
        }),
    },

    // Budgets
    budgets: {
      /**
       * Find many budgets for the current user
       */
      findMany: (args?: any) =>
        db.budget.findMany({
          ...args,
          where: { ...args?.where, userId },
        }),

      /**
       * Find a unique budget by ID (scoped to current user)
       * Returns null if budget doesn't exist or belongs to another user
       */
      findUnique: (id: string) =>
        db.budget.findFirst({
          where: { id, userId },
        }),

      /**
       * Create a budget for the current user
       */
      create: (data: any) =>
        db.budget.create({
          data: {
            ...data,
            user: { connect: { id: userId } },
          },
        }),

      /**
       * Update a budget (only if it belongs to current user)
       * Returns { count: 0 } if budget doesn't exist or belongs to another user
       */
      update: (id: string, data: any) =>
        db.budget.updateMany({
          where: { id, userId },
          data,
        }),

      /**
       * Delete a budget (only if it belongs to current user)
       * Returns { count: 0 } if budget doesn't exist or belongs to another user
       */
      delete: (id: string) =>
        db.budget.deleteMany({
          where: { id, userId },
        }),

      /**
       * Count budgets for the current user
       */
      count: (args?: any) =>
        db.budget.count({
          ...args,
          where: { ...args?.where, userId },
        }),
    },
  };
}
