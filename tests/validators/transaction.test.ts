import { describe, it, expect } from 'vitest';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
  bulkReassignSchema,
} from '@/lib/validators/transaction';
import { TxnType } from '@prisma/client';
import { ZodError } from 'zod';

describe('Transaction Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    describe('Valid inputs', () => {
      it('should accept valid transaction data', () => {
        const result = createTransactionSchema.parse({
          amount: 100.5,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          note: 'Lunch',
          tags: ['food', 'restaurant'],
        });

        expect(result.amount).toBe(100.5);
        expect(result.type).toBe(TxnType.expense);
        expect(result.note).toBe('Lunch');
        expect(result.tags).toEqual(['food', 'restaurant']);
      });

      it('should accept transaction without optional fields', () => {
        const result = createTransactionSchema.parse({
          amount: 50,
          type: TxnType.income,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.amount).toBe(50);
        expect(result.note).toBeUndefined();
        expect(result.tags).toBeUndefined();
      });

      it('should accept amount with 2 decimal places', () => {
        const result = createTransactionSchema.parse({
          amount: 123.45,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.amount).toBe(123.45);
      });

      it('should accept amount with 1 decimal place', () => {
        const result = createTransactionSchema.parse({
          amount: 50.5,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.amount).toBe(50.5);
      });

      it('should accept amount with no decimals', () => {
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.amount).toBe(100);
      });

      it('should coerce date strings to Date objects', () => {
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: '2024-01-01',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.txnDate).toBeInstanceOf(Date);
      });

      it('should accept maximum of 10 tags', () => {
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          tags: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        });

        expect(result.tags).toHaveLength(10);
      });

      it('should accept note with exactly 500 characters', () => {
        const longNote = 'a'.repeat(500);
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          note: longNote,
        });

        expect(result.note).toBe(longNote);
      });

      it('should accept maximum amount', () => {
        const result = createTransactionSchema.parse({
          amount: 999999999.99,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.amount).toBe(999999999.99);
      });
    });

    describe('Amount validation', () => {
      it('should reject negative amount', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: -50,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Amount must be positive');
      });

      it('should reject zero amount', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 0,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Amount must be positive');
      });

      it('should reject amount with 3 decimal places', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 123.456,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Amount must have max 2 decimal places');
      });

      it('should reject amount exceeding maximum', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 1000000000,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Amount too large');
      });
    });

    describe('Transaction date validation', () => {
      it('should reject future date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: futureDate,
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Transaction date cannot be in the future');
      });

      it('should accept current date', () => {
        // Use a date slightly in the past to avoid timing issues
        const now = new Date(Date.now() - 1000);
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: now,
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.txnDate).toBeInstanceOf(Date);
      });

      it('should accept past date', () => {
        const pastDate = new Date('2020-01-01');
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: pastDate,
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.txnDate).toEqual(pastDate);
      });
    });

    describe('Note validation', () => {
      it('should reject note with 501 characters', () => {
        const longNote = 'a'.repeat(501);

        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
            note: longNote,
          });
        }).toThrow('Note too long (max 500 characters)');
      });
    });

    describe('Tags validation', () => {
      it('should reject more than 10 tags', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
            tags: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
          });
        }).toThrow('Maximum 10 tags');
      });
    });

    describe('UUID validation', () => {
      it('should reject invalid category UUID', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: 'not-a-uuid',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Invalid category ID');
      });

      it('should reject invalid account UUID', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: 'not-a-uuid',
          });
        }).toThrow('Invalid account ID');
      });
    });

    describe('Type validation', () => {
      it('should accept expense type', () => {
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.type).toBe(TxnType.expense);
      });

      it('should accept income type', () => {
        const result = createTransactionSchema.parse({
          amount: 100,
          type: TxnType.income,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.type).toBe(TxnType.income);
      });

      it('should reject invalid type', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: 'invalid',
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });
    });

    describe('Missing required fields', () => {
      it('should reject missing amount', () => {
        expect(() => {
          createTransactionSchema.parse({
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });

      it('should reject missing type', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });

      it('should reject missing txnDate', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });

      it('should reject missing categoryId', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            accountId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });

      it('should reject missing accountId', () => {
        expect(() => {
          createTransactionSchema.parse({
            amount: 100,
            type: TxnType.expense,
            txnDate: new Date('2024-01-01'),
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });
    });
  });

  describe('updateTransactionSchema', () => {
    describe('Valid partial updates', () => {
      it('should accept update with only amount', () => {
        const result = updateTransactionSchema.parse({
          amount: 150.5,
        });

        expect(result.amount).toBe(150.5);
      });

      it('should accept update with only type', () => {
        const result = updateTransactionSchema.parse({
          type: TxnType.income,
        });

        expect(result.type).toBe(TxnType.income);
      });

      it('should accept update with only note', () => {
        const result = updateTransactionSchema.parse({
          note: 'Updated note',
        });

        expect(result.note).toBe('Updated note');
      });

      it('should accept update with multiple fields', () => {
        const result = updateTransactionSchema.parse({
          amount: 200,
          note: 'Multi-field update',
          tags: ['updated'],
        });

        expect(result.amount).toBe(200);
        expect(result.note).toBe('Multi-field update');
        expect(result.tags).toEqual(['updated']);
      });

      it('should accept null note to clear it', () => {
        const result = updateTransactionSchema.parse({
          note: null,
        });

        expect(result.note).toBeNull();
      });

      it('should accept all fields', () => {
        const result = updateTransactionSchema.parse({
          amount: 100,
          type: TxnType.expense,
          txnDate: new Date('2024-01-01'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          note: 'Complete update',
          tags: ['tag1'],
        });

        expect(result.amount).toBe(100);
        expect(result.type).toBe(TxnType.expense);
        expect(result.note).toBe('Complete update');
      });
    });

    describe('Validation rules on optional fields', () => {
      it('should reject negative amount when provided', () => {
        expect(() => {
          updateTransactionSchema.parse({
            amount: -50,
          });
        }).toThrow('Amount must be positive');
      });

      it('should reject amount with 3 decimal places when provided', () => {
        expect(() => {
          updateTransactionSchema.parse({
            amount: 123.456,
          });
        }).toThrow('Amount must have max 2 decimal places');
      });

      it('should reject future date when provided', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        expect(() => {
          updateTransactionSchema.parse({
            txnDate: futureDate,
          });
        }).toThrow('Transaction date cannot be in the future');
      });

      it('should reject note over 500 characters when provided', () => {
        const longNote = 'a'.repeat(501);

        expect(() => {
          updateTransactionSchema.parse({
            note: longNote,
          });
        }).toThrow('Note too long (max 500 characters)');
      });

      it('should reject more than 10 tags when provided', () => {
        expect(() => {
          updateTransactionSchema.parse({
            tags: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
          });
        }).toThrow('Maximum 10 tags');
      });

      it('should reject invalid category UUID when provided', () => {
        expect(() => {
          updateTransactionSchema.parse({
            categoryId: 'not-a-uuid',
          });
        }).toThrow('Invalid category ID');
      });

      it('should reject invalid account UUID when provided', () => {
        expect(() => {
          updateTransactionSchema.parse({
            accountId: 'not-a-uuid',
          });
        }).toThrow('Invalid account ID');
      });
    });

    describe('Empty update validation', () => {
      it('should reject empty object', () => {
        expect(() => {
          updateTransactionSchema.parse({});
        }).toThrow('At least one field must be provided');
      });
    });
  });

  describe('transactionFiltersSchema', () => {
    describe('Valid filters', () => {
      it('should accept empty filters', () => {
        const result = transactionFiltersSchema.parse({});
        expect(result).toEqual({});
      });

      it('should accept from date', () => {
        const result = transactionFiltersSchema.parse({
          from: new Date('2024-01-01'),
        });

        expect(result.from).toBeInstanceOf(Date);
      });

      it('should accept to date', () => {
        const result = transactionFiltersSchema.parse({
          to: new Date('2024-12-31'),
        });

        expect(result.to).toBeInstanceOf(Date);
      });

      it('should accept categoryId', () => {
        const result = transactionFiltersSchema.parse({
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.categoryId).toBe('550e8400-e29b-41d4-a716-446655440000');
      });

      it('should accept accountId', () => {
        const result = transactionFiltersSchema.parse({
          accountId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.accountId).toBe('660e8400-e29b-41d4-a716-446655440000');
      });

      it('should accept type', () => {
        const result = transactionFiltersSchema.parse({
          type: TxnType.expense,
        });

        expect(result.type).toBe(TxnType.expense);
      });

      it('should accept search query', () => {
        const result = transactionFiltersSchema.parse({
          q: 'lunch',
        });

        expect(result.q).toBe('lunch');
      });

      it('should accept all filters together', () => {
        const result = transactionFiltersSchema.parse({
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31'),
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          type: TxnType.expense,
          q: 'lunch',
        });

        expect(result.from).toBeInstanceOf(Date);
        expect(result.to).toBeInstanceOf(Date);
        expect(result.categoryId).toBe('550e8400-e29b-41d4-a716-446655440000');
        expect(result.accountId).toBe('660e8400-e29b-41d4-a716-446655440000');
        expect(result.type).toBe(TxnType.expense);
        expect(result.q).toBe('lunch');
      });

      it('should coerce date strings', () => {
        const result = transactionFiltersSchema.parse({
          from: '2024-01-01',
          to: '2024-12-31',
        });

        expect(result.from).toBeInstanceOf(Date);
        expect(result.to).toBeInstanceOf(Date);
      });
    });

    describe('Invalid filters', () => {
      it('should reject invalid categoryId UUID', () => {
        expect(() => {
          transactionFiltersSchema.parse({
            categoryId: 'not-a-uuid',
          });
        }).toThrow(ZodError);
      });

      it('should reject invalid accountId UUID', () => {
        expect(() => {
          transactionFiltersSchema.parse({
            accountId: 'not-a-uuid',
          });
        }).toThrow(ZodError);
      });

      it('should reject invalid type', () => {
        expect(() => {
          transactionFiltersSchema.parse({
            type: 'invalid',
          });
        }).toThrow(ZodError);
      });
    });
  });

  describe('bulkReassignSchema', () => {
    describe('Valid inputs', () => {
      it('should accept single transaction ID', () => {
        const result = bulkReassignSchema.parse({
          ids: ['550e8400-e29b-41d4-a716-446655440000'],
          categoryId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.ids).toHaveLength(1);
        expect(result.categoryId).toBe('660e8400-e29b-41d4-a716-446655440000');
      });

      it('should accept multiple transaction IDs', () => {
        const result = bulkReassignSchema.parse({
          ids: [
            '550e8400-e29b-41d4-a716-446655440000',
            '660e8400-e29b-41d4-a716-446655440000',
            '770e8400-e29b-41d4-a716-446655440000',
          ],
          categoryId: '880e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.ids).toHaveLength(3);
      });

      it('should accept maximum 100 transaction IDs', () => {
        const ids = Array.from(
          { length: 100 },
          (_, i) => `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`
        );

        const result = bulkReassignSchema.parse({
          ids,
          categoryId: '660e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.ids).toHaveLength(100);
      });
    });

    describe('Invalid inputs', () => {
      it('should reject empty array', () => {
        expect(() => {
          bulkReassignSchema.parse({
            ids: [],
            categoryId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('At least one transaction ID required');
      });

      it('should reject more than 100 transaction IDs', () => {
        const ids = Array.from(
          { length: 101 },
          (_, i) => `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`
        );

        expect(() => {
          bulkReassignSchema.parse({
            ids,
            categoryId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Maximum 100 transactions per request');
      });

      it('should reject invalid transaction ID UUID', () => {
        expect(() => {
          bulkReassignSchema.parse({
            ids: ['not-a-uuid'],
            categoryId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow('Invalid transaction ID');
      });

      it('should reject invalid category ID UUID', () => {
        expect(() => {
          bulkReassignSchema.parse({
            ids: ['550e8400-e29b-41d4-a716-446655440000'],
            categoryId: 'not-a-uuid',
          });
        }).toThrow('Invalid category ID');
      });

      it('should reject missing ids', () => {
        expect(() => {
          bulkReassignSchema.parse({
            categoryId: '660e8400-e29b-41d4-a716-446655440000',
          });
        }).toThrow(ZodError);
      });

      it('should reject missing categoryId', () => {
        expect(() => {
          bulkReassignSchema.parse({
            ids: ['550e8400-e29b-41d4-a716-446655440000'],
          });
        }).toThrow(ZodError);
      });
    });
  });
});
