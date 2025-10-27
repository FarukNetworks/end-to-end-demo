# TASK-TXN-002 - Implement POST /api/transactions Endpoint

## Context & Goal

**Business Value:** Enable users to create new transactions via API to support sub-10s transaction logging (FR-008, NF-003)  
**Epic:** EPIC-03 Transaction Management  
**User Story:** US-TXN-01 - As a user, I want to log an expense in under 10 seconds  
**PRD Reference:** FR-008 (Create transaction), NF-003 (API <500ms P95)

## Scope Definition

**✅ In Scope:**

- POST /api/transactions endpoint implementation
- Zod validation schema for transaction creation
- Database insert with Prisma
- User scoping (transactions belong to authenticated user)
- Type validation (expense/income matches category type)
- Amount validation (positive, max 2 decimals)
- Date validation (not in future)
- Category and account ownership validation
- Success response with created transaction
- Error handling for validation and database errors

**⛔ Out of Scope:**

- Recurring transactions (Stretch)
- Transaction attachments (V1.1)
- Bulk transaction creation (separate task)
- Transaction templates (V2)

## Technical Specifications

**Implementation Details:**

- Create `/app/api/transactions/route.ts`:

  ```typescript
  import { NextResponse } from 'next/server';
  import { db } from '@/lib/db';
  import { requireApiAuth } from '@/lib/api-auth';
  import { createTransactionSchema } from '@/lib/validators/transaction';

  export async function POST(req: Request) {
    try {
      // Authenticate user
      const { error, user } = await requireApiAuth();
      if (error) return error;

      // Parse and validate request body
      const body = await req.json();
      const validatedData = createTransactionSchema.parse(body);

      // Verify category belongs to user and type matches
      const category = await db.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_CATEGORY',
              message: 'Category not found or access denied',
            },
          },
          { status: 404 }
        );
      }

      if (category.type !== validatedData.type) {
        return NextResponse.json(
          {
            error: {
              code: 'TYPE_MISMATCH',
              message: `Transaction type must match category type (${category.type})`,
            },
          },
          { status: 400 }
        );
      }

      // Verify account belongs to user
      const account = await db.account.findFirst({
        where: {
          id: validatedData.accountId,
          userId: user.id,
        },
      });

      if (!account) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_ACCOUNT',
              message: 'Account not found or access denied',
            },
          },
          { status: 404 }
        );
      }

      // Create transaction
      const transaction = await db.transaction.create({
        data: {
          userId: user.id,
          amount: validatedData.amount,
          currency: 'EUR',
          type: validatedData.type,
          categoryId: validatedData.categoryId,
          accountId: validatedData.accountId,
          txnDate: validatedData.txnDate,
          note: validatedData.note || null,
          tags: validatedData.tags || [],
        },
        include: {
          category: {
            select: { name: true, color: true },
          },
          account: {
            select: { name: true },
          },
        },
      });

      return NextResponse.json({ data: transaction }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }

      console.error('Transaction creation error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create transaction',
          },
        },
        { status: 500 }
      );
    }
  }
  ```

- Create validation schema in `/lib/validators/transaction.ts`:

  ```typescript
  import { z } from 'zod';
  import { TxnType } from '@prisma/client';

  export const createTransactionSchema = z.object({
    amount: z
      .number()
      .positive('Amount must be positive')
      .max(999999999.99, 'Amount too large')
      .refine(val => Number(val.toFixed(2)) === val, {
        message: 'Amount must have max 2 decimal places',
      }),
    type: z.nativeEnum(TxnType, {
      errorMap: () => ({ message: 'Type must be expense or income' }),
    }),
    txnDate: z.coerce
      .date()
      .max(new Date(), 'Transaction date cannot be in the future'),
    categoryId: z.string().uuid('Invalid category ID'),
    accountId: z.string().uuid('Invalid account ID'),
    note: z.string().max(500, 'Note too long (max 500 characters)').optional(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
  });
  ```

**Architecture References:**

- PRD FR-008: Transaction creation requirements
- PRD NF-003: API response time <500ms
- PRD Section 11: Validation & Business Rules

## Acceptance Criteria

1. **Given** authenticated user with valid transaction data
   **When** POST /api/transactions
   **Then** return 201 with created transaction including category and account details

2. **Given** amount ≤ 0
   **When** POST /api/transactions
   **Then** return 400 with validation error "Amount must be positive"

3. **Given** type is "expense" but category type is "income"
   **When** POST /api/transactions
   **Then** return 400 with error "Transaction type must match category type"

4. **Given** categoryId belongs to different user
   **When** POST /api/transactions
   **Then** return 404 with error "Category not found or access denied"

5. **Given** txnDate is in the future
   **When** POST /api/transactions
   **Then** return 400 with validation error "Transaction date cannot be in the future"

6. **Given** valid transaction creation
   **When** checking database
   **Then** transaction.userId equals authenticated user.id

7. **Given** typical transaction creation
   **When** measuring API response time
   **Then** P95 latency <500ms (measured with load testing)

## Definition of Done

- [ ] POST /api/transactions endpoint implemented
- [ ] createTransactionSchema Zod validation created
- [ ] User authentication required
- [ ] Category ownership and type validation
- [ ] Account ownership validation
- [ ] Amount validation (positive, max 2 decimals)
- [ ] Date validation (not future)
- [ ] Database insert with user scoping
- [ ] Error handling for all cases
- [ ] Unit tests for validation schema (>90% coverage)
- [ ] Integration test for successful creation
- [ ] Integration test for validation errors
- [ ] Integration test for ownership checks
- [ ] API returns 201 with transaction data
- [ ] Performance test shows P95 <500ms

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-003 (Database + Prisma)
- TASK-AUTH-003 (Protected routes)
- TASK-CAT-001 (Categories exist)
- TASK-ACC-001 (Accounts exist)

**External Dependencies:** Prisma, Zod  
**Parallel Tasks:** TXN-003, TXN-004, TXN-005, TXN-006  
**Downstream Impact:** TXN-007 (Form calls this endpoint)

## Resources & References

**Design Assets:** N/A (API endpoint)  
**Technical Docs:**

- Prisma transactions: https://www.prisma.io/docs/concepts/components/prisma-client/transactions
- Zod validation: https://zod.dev/

**PRD References:** FR-008, FR-009, NF-003, Section 11  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Endpoint implementation: 2 hours
- Validation schema: 1.5 hours
- Ownership checks: 1.5 hours
- Error handling: 1 hour
- Testing: 2 hours

**Priority:** P0 (Must-have - core transaction feature)  
**Risk Level:** Medium (business logic complexity)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Integration testing)  
**Stakeholder:** Product Manager
