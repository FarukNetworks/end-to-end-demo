# TASK-FOUND-007 - Create Database Seed Scripts (Categories, Accounts, Demo Data)

## Context & Goal

**Business Value:** Provide seed data for development and default data for production user signups (FR-016, FR-026)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 14 (Seeding, Migrations, Defaults), FR-016 (Default categories), FR-026 (Default accounts)

## Scope Definition

**✅ In Scope:**

- System default categories seed function (10 categories)
- Default accounts seed function (Cash, Card)
- Demo transaction data for development environment
- Seed script execution via `prisma db seed`
- Reusable seed functions for user signup
- TypeScript type-safe seed data

**⛔ Out of Scope:**

- Production data migration (separate deployment task)
- User import/export (V1.1)
- Seed data for testing (handled in test setup)

## Technical Specifications

**Implementation Details:**

- Create `/prisma/seed.ts`:

  ```typescript
  import { PrismaClient, CategoryType, TxnType } from '@prisma/client';

  const prisma = new PrismaClient();

  async function main() {
    // Create demo user for development
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@budgetbuddy.app' },
      update: {},
      create: {
        email: 'demo@budgetbuddy.app',
        passwordHash:
          '$2a$10$Kxm3Z8kU6Z1J6hB6HkI8KOqF6LvX3X7F6X7F6X7F6X7F6X7F6X7', // 'password'
        name: 'Demo User',
      },
    });

    console.log('Created demo user:', demoUser.email);

    // Seed default categories
    await seedDefaultCategories(prisma, demoUser.id);

    // Seed default accounts
    await seedDefaultAccounts(prisma, demoUser.id);

    // Seed demo transactions (development only)
    if (process.env.NODE_ENV === 'development') {
      await seedDemoTransactions(prisma, demoUser.id);
    }
  }

  export async function seedDefaultCategories(
    tx: PrismaClient,
    userId: string
  ) {
    const categories = [
      // Expense categories
      {
        name: 'Groceries',
        color: '#10b981',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Dining Out',
        color: '#f59e0b',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Transport',
        color: '#3b82f6',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Utilities',
        color: '#8b5cf6',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Rent',
        color: '#ef4444',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Entertainment',
        color: '#ec4899',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Health',
        color: '#14b8a6',
        type: CategoryType.expense,
        isSystem: true,
      },
      {
        name: 'Shopping',
        color: '#f97316',
        type: CategoryType.expense,
        isSystem: true,
      },
      // Income categories
      {
        name: 'Salary',
        color: '#22c55e',
        type: CategoryType.income,
        isSystem: true,
      },
      {
        name: 'Other Income',
        color: '#84cc16',
        type: CategoryType.income,
        isSystem: true,
      },
    ];

    for (const category of categories) {
      await tx.category.create({
        data: {
          ...category,
          userId,
        },
      });
    }

    console.log(
      `Created ${categories.length} default categories for user ${userId}`
    );
  }

  export async function seedDefaultAccounts(tx: PrismaClient, userId: string) {
    const accounts = [
      { name: 'Cash', color: '#22c55e' },
      { name: 'Card', color: '#3b82f6' },
    ];

    for (const account of accounts) {
      await tx.account.create({
        data: {
          ...account,
          userId,
        },
      });
    }

    console.log(
      `Created ${accounts.length} default accounts for user ${userId}`
    );
  }

  async function seedDemoTransactions(prisma: PrismaClient, userId: string) {
    const categories = await prisma.category.findMany({ where: { userId } });
    const accounts = await prisma.account.findMany({ where: { userId } });

    const groceriesCategory = categories.find(c => c.name === 'Groceries');
    const diningCategory = categories.find(c => c.name === 'Dining Out');
    const salaryCategory = categories.find(c => c.name === 'Salary');
    const cashAccount = accounts.find(a => a.name === 'Cash');
    const cardAccount = accounts.find(a => a.name === 'Card');

    if (!groceriesCategory || !cashAccount || !cardAccount) {
      console.warn('Required categories or accounts not found for demo data');
      return;
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const transactions = [
      // This month
      {
        userId,
        amount: 3000,
        currency: 'EUR',
        type: TxnType.income,
        categoryId: salaryCategory!.id,
        accountId: cardAccount.id,
        txnDate: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
        note: 'Monthly salary',
      },
      {
        userId,
        amount: 85.5,
        currency: 'EUR',
        type: TxnType.expense,
        categoryId: groceriesCategory.id,
        accountId: cardAccount.id,
        txnDate: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
        note: 'Weekly groceries',
      },
      {
        userId,
        amount: 45.0,
        currency: 'EUR',
        type: TxnType.expense,
        categoryId: diningCategory!.id,
        accountId: cashAccount.id,
        txnDate: new Date(thisMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
        note: 'Dinner with friends',
      },
      // Add 15-20 more demo transactions spanning this month and last month
    ];

    for (const transaction of transactions) {
      await prisma.transaction.create({ data: transaction });
    }

    console.log(`Created ${transactions.length} demo transactions`);
  }

  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```

- Update `package.json`:

  ```json
  {
    "prisma": {
      "seed": "tsx prisma/seed.ts"
    }
  }
  ```

- Create seed utility exports in `/lib/seed/categories.ts` and `/lib/seed/accounts.ts` for use in AUTH-001

**Architecture References:**

- PRD Section 14: Seeding, Migrations, Defaults
- Prisma Seeding: https://www.prisma.io/docs/guides/database/seed-database

## Acceptance Criteria

1. **Given** clean database
   **When** running `npm run prisma db seed`
   **Then** demo user, categories, accounts, and transactions created

2. **Given** seedDefaultCategories function called
   **When** checking database
   **Then** 10 system categories exist (8 expense, 2 income)

3. **Given** seedDefaultAccounts function called
   **When** checking database
   **Then** 2 default accounts exist (Cash, Card)

4. **Given** development environment
   **When** running seed
   **Then** demo transactions created for this month and last month

5. **Given** production environment
   **When** running seed
   **Then** demo transactions NOT created (only defaults)

## Definition of Done

- [ ] prisma/seed.ts created with main function
- [ ] seedDefaultCategories function exported and reusable
- [ ] seedDefaultAccounts function exported and reusable
- [ ] Demo user created for development
- [ ] 10 system categories with correct colors and types
- [ ] 2 default accounts created
- [ ] 20-30 demo transactions for development only
- [ ] package.json prisma.seed configured
- [ ] Seed functions callable from AUTH-001 (signup)
- [ ] Seed script runs without errors
- [ ] Demo data visible in local database

## Dependencies

**Upstream Tasks:** TASK-FOUND-003 (Database schema)  
**External Dependencies:** Prisma, tsx (for running TypeScript)  
**Parallel Tasks:** TASK-FOUND-001 to FOUND-006  
**Downstream Impact:** AUTH-001 (signup uses seed functions), CAT-001, ACC-001

## Resources & References

**Design Assets:** N/A (seed data)  
**Technical Docs:**

- Prisma Seeding: https://www.prisma.io/docs/guides/database/seed-database

**PRD References:** Section 14, FR-016, FR-026  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 4 story points (5-7 hours)

- Seed script structure: 1 hour
- Category seed function: 1.5 hours
- Account seed function: 1 hour
- Demo transaction data: 2 hours
- Testing: 1-1.5 hours

**Priority:** P0 (Must-have - needed for development and signup)  
**Risk Level:** Low (data seeding)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** N/A (seed script)  
**Stakeholder:** Engineering Lead
