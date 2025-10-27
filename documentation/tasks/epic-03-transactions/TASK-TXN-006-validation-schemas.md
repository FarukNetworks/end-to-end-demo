# TASK-TXN-006 - Create Transaction Validation Schemas (Zod)

## Context & Goal

**Business Value:** Ensure data quality and prevent invalid transactions (FR-009)  
**Epic:** EPIC-03 Transaction Management  
**PRD Reference:** FR-009 (Form validation), Section 11 (Validation rules)

## Scope Definition

**✅ In Scope:**

- createTransactionSchema (already in TXN-002)
- updateTransactionSchema for PATCH
- Transaction validation rules (amount > 0, date not future, etc.)
- Type exports for TypeScript inference
- Reusable validation functions

**⛔ Out of Scope:**

- Backend-only validation (e.g., unique constraints) - handled in endpoints
- Complex business rules (handled in endpoints)

## Technical Specifications

**Implementation Details:**

```typescript
// /lib/validators/transaction.ts
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
  type: z.nativeEnum(TxnType),
  txnDate: z.coerce
    .date()
    .max(new Date(), 'Transaction date cannot be in the future'),
  categoryId: z.string().uuid('Invalid category ID'),
  accountId: z.string().uuid('Invalid account ID'),
  note: z.string().max(500, 'Note too long (max 500 characters)').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  type: z.nativeEnum(TxnType).optional(),
  q: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
```

## Acceptance Criteria

1. **Given** amount = -50
   **When** validating with createTransactionSchema
   **Then** throw error "Amount must be positive"

2. **Given** amount = 123.456 (3 decimals)
   **When** validating
   **Then** throw error "Amount must have max 2 decimal places"

3. **Given** txnDate in future
   **When** validating
   **Then** throw error "Transaction date cannot be in the future"

4. **Given** note with 501 characters
   **When** validating
   **Then** throw error "Note too long"

5. **Given** partial update (only amount)
   **When** validating with updateTransactionSchema
   **Then** validation passes (optional fields)

## Definition of Done

- [ ] createTransactionSchema defined
- [ ] updateTransactionSchema (partial) defined
- [ ] transactionFiltersSchema defined
- [ ] Type exports for TypeScript
- [ ] All validation rules per PRD Section 11
- [ ] Unit tests for each validation rule (>95% coverage)
- [ ] Used in TXN-002, TXN-003 endpoints

## Dependencies

**Upstream:** TASK-FOUND-005 (Zod setup)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)
