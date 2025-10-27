# TASK-TEST-002 - Write Unit Tests for Zod Validators

## Context & Goal

**Business Value:** Ensure validation logic correctness (Section 16, NF-016)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (Unit tests for validators)

## Scope Definition

**✅ In Scope:**

- Tests for createTransactionSchema
- Tests for createCategorySchema
- Tests for createAccountSchema
- Tests for all validation rules
- Edge cases and error messages
- > 95% coverage for validators

**⛔ Out of Scope:**

- Integration tests (covered in API tests)

## Technical Specifications

```typescript
// /tests/unit/validators/transaction.test.ts
import { describe, it, expect } from 'vitest';
import { createTransactionSchema } from '@/lib/validators/transaction';
import { TxnType } from '@prisma/client';

describe('createTransactionSchema', () => {
  it('should validate valid transaction data', () => {
    const validData = {
      amount: 100.5,
      type: TxnType.expense,
      txnDate: new Date(),
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      accountId: '123e4567-e89b-12d3-a456-426614174001',
      note: 'Groceries',
      tags: ['food', 'weekly'],
    };

    const result = createTransactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', () => {
    const invalidData = {
      amount: -50,
      type: TxnType.expense,
      txnDate: new Date(),
      categoryId: 'valid-uuid',
      accountId: 'valid-uuid',
    };

    const result = createTransactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toContain('positive');
  });

  it('should reject amount with >2 decimals', () => {
    const invalidData = {
      amount: 100.456,
      type: TxnType.expense,
      txnDate: new Date(),
      categoryId: 'valid-uuid',
      accountId: 'valid-uuid',
    };

    const result = createTransactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toContain('2 decimal places');
  });

  it('should reject future date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const invalidData = {
      amount: 100,
      type: TxnType.expense,
      txnDate: futureDate,
      categoryId: 'valid-uuid',
      accountId: 'valid-uuid',
    };

    const result = createTransactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toContain('future');
  });

  it('should reject note >500 characters', () => {
    const invalidData = {
      amount: 100,
      type: TxnType.expense,
      txnDate: new Date(),
      categoryId: 'valid-uuid',
      accountId: 'valid-uuid',
      note: 'a'.repeat(501),
    };

    const result = createTransactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject >10 tags', () => {
    const invalidData = {
      amount: 100,
      type: TxnType.expense,
      txnDate: new Date(),
      categoryId: 'valid-uuid',
      accountId: 'valid-uuid',
      tags: Array(11).fill('tag'),
    };

    const result = createTransactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

## Acceptance Criteria

1. **Given** all validator schemas
   **When** running unit tests
   **Then** >95% code coverage

2. **Given** validation rules
   **When** testing
   **Then** all rules have corresponding test cases

3. **Given** error messages
   **When** validation fails
   **Then** correct error message returned

4. **Given** edge cases
   **When** testing
   **Then** boundary values tested (0, max length, etc.)

## Definition of Done

- [ ] Tests for transaction validators
- [ ] Tests for category validators
- [ ] Tests for account validators
- [ ] All validation rules tested
- [ ] Error messages verified
- [ ] Edge cases covered
- [ ] > 95% coverage achieved

## Dependencies

**Upstream:** TASK-TEST-001 (Vitest setup), TASK-TXN-006, TASK-CAT-006, TASK-ACC-006  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA/Backend Engineer)
