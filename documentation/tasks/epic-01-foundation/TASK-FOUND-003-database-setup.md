# TASK-FOUND-003 - Configure PostgreSQL Database and Prisma ORM

## Context & Goal

**Business Value:** Establish data persistence layer to enable all feature development and data storage  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 7 (Data Model), NF-006 to NF-009 (Scalability)

## Scope Definition

**✅ In Scope:**

- PostgreSQL database setup (local development + staging)
- Prisma ORM installation and configuration
- Complete database schema per PRD Section 7
- Initial migration creation
- Database connection pooling configuration
- Seed data script structure

**⛔ Out of Scope:**

- Actual seed data implementation (TASK-FOUND-007)
- Production database provisioning (M5 deployment)
- Database backup/restore procedures (DevOps task)
- Query optimization (handled per feature)

## Technical Specifications

**Implementation Details:**

- Install Prisma: `npm install prisma @prisma/client`
- Initialize Prisma: `npx prisma init`
- Configure DATABASE_URL in .env (PostgreSQL connection string)
- Create complete schema in `prisma/schema.prisma`:

  ```prisma
  model User {
    id String @id @default(uuid())
    email String @unique
    passwordHash String
    name String?
    createdAt DateTime @default(now())
    accounts Account[]
    categories Category[]
    transactions Transaction[]
    budgets Budget[]
  }

  model Account {
    id String @id @default(uuid())
    userId String
    name String
    color String @default("#6b7280")
    createdAt DateTime @default(now())
    user User @relation(fields: [userId], references: [id])
    txns Transaction[]
    @@index([userId, name])
  }

  enum CategoryType { expense income }

  model Category {
    id String @id @default(uuid())
    userId String
    name String
    color String @default("#22c55e")
    type CategoryType
    isSystem Boolean @default(false)
    createdAt DateTime @default(now())
    user User @relation(fields: [userId], references: [id])
    txns Transaction[]
    budgets Budget[]
    @@index([userId, type, name])
  }

  enum TxnType { expense income }

  model Transaction {
    id String @id @default(uuid())
    userId String
    accountId String
    categoryId String
    amount Decimal @db.Decimal(12,2)
    currency String @default("EUR")
    type TxnType
    txnDate DateTime
    note String?
    tags String[]
    attachmentUrl String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    user User @relation(fields: [userId], references: [id])
    account Account @relation(fields: [accountId], references: [id])
    category Category @relation(fields: [categoryId], references: [id])
    @@index([userId, txnDate])
    @@index([userId, categoryId])
  }

  model Budget {
    id String @id @default(uuid())
    userId String
    categoryId String
    year Int
    month Int
    targetAmount Decimal @db.Decimal(12,2)
    createdAt DateTime @default(now())
    user User @relation(fields: [userId], references: [id])
    category Category @relation(fields: [categoryId], references: [id])
    @@unique([userId, categoryId, year, month])
  }
  ```

- Configure connection pooling: `connection_limit = 10`
- Create Prisma client singleton in `/lib/db.ts`
- Run initial migration: `npx prisma migrate dev --name init`

**Architecture References:**

- PRD Section 7: Complete ERD and schema
- Prisma documentation: https://www.prisma.io/docs
- PostgreSQL indexing best practices

## Acceptance Criteria

1. **Given** DATABASE_URL configured
   **When** running `npx prisma db push`
   **Then** database schema created successfully

2. **Given** schema with all models
   **When** running `npx prisma generate`
   **Then** Prisma Client generated with TypeScript types

3. **Given** Prisma Client singleton
   **When** importing from `@/lib/db`
   **Then** client connects to database without errors

4. **Given** indexes on userId and txnDate
   **When** querying transactions for a user
   **Then** query uses index (verify with EXPLAIN ANALYZE)

5. **Given** unique constraint on User.email
   **When** attempting to create duplicate email
   **Then** Prisma throws unique constraint error

## Definition of Done

- [ ] PostgreSQL database running (Docker or managed service)
- [ ] Prisma installed and configured
- [ ] Complete schema created with all models (User, Account, Category, Transaction, Budget)
- [ ] All indexes defined per PRD Section 7
- [ ] Initial migration created and applied
- [ ] Prisma Client generated successfully
- [ ] Database connection singleton implemented in /lib/db.ts
- [ ] Connection pooling configured (max 10 connections)
- [ ] Schema validated against PRD Section 7
- [ ] Migration script runs without errors

## Dependencies

**Upstream Tasks:** TASK-FOUND-001 (Next.js project setup)  
**External Dependencies:** PostgreSQL 14+ (Docker or managed service)  
**Parallel Tasks:** TASK-FOUND-002 (shadcn/ui setup)  
**Downstream Impact:** All data-dependent tasks (auth, transactions, categories, accounts)

## Resources & References

**Design Assets:** N/A (database schema)  
**Technical Docs:**

- Prisma documentation: https://www.prisma.io/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
  **PRD References:** Section 7 (Data Model), NF-008 (Database scalability)  
  **SAS References:** TBD (database architecture)

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Prisma setup: 1 hour
- Schema implementation: 3-4 hours
- Migration testing: 1-2 hours
- Connection pooling + client setup: 1 hour

**Priority:** P0 (Must-have - blocks all data features)  
**Risk Level:** Low (standard ORM setup)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** N/A (infrastructure task)  
**Stakeholder:** Engineering Lead
