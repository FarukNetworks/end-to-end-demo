import { z } from 'zod';
import { TxnType } from '@prisma/client';

/**
 * Validation schema for user signup
 * FR-001, FR-002: Email/password authentication requirements
 */
export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Validation schema for user login
 * FR-003: Login form validation requirements
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validation schema for transaction creation
 * FR-008: Create transaction requirements
 * FR-009: Transaction validation rules
 */
export const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount too large')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'Amount must have max 2 decimal places',
    }),
  type: z.nativeEnum(TxnType, {
    errorMap: () => ({ message: 'Type must be expense or income' }),
  }),
  txnDate: z.coerce.date().refine((date) => date <= new Date(), {
    message: 'Transaction date cannot be in the future',
  }),
  categoryId: z.string().uuid('Invalid category ID'),
  accountId: z.string().uuid('Invalid account ID'),
  note: z.string().max(500, 'Note too long (max 500 characters)').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

/**
 * Validation schema for transaction update
 * FR-011: Update transaction requirements
 * All fields optional for partial updates
 */
export const updateTransactionSchema = z
  .object({
    amount: z
      .number()
      .positive('Amount must be positive')
      .max(999999999.99, 'Amount too large')
      .refine((val) => Number(val.toFixed(2)) === val, {
        message: 'Amount must have max 2 decimal places',
      })
      .optional(),
    type: z
      .nativeEnum(TxnType, {
        errorMap: () => ({ message: 'Type must be expense or income' }),
      })
      .optional(),
    txnDate: z.coerce
      .date()
      .refine((date) => date <= new Date(), {
        message: 'Transaction date cannot be in the future',
      })
      .optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    accountId: z.string().uuid('Invalid account ID').optional(),
    note: z.string().max(500, 'Note too long (max 500 characters)').optional().nullable(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

/**
 * Validation schema for bulk category reassignment
 * FR-015: Bulk category reassignment requirements
 */
export const bulkReassignSchema = z.object({
  ids: z
    .array(z.string().uuid('Invalid transaction ID'))
    .min(1, 'At least one transaction ID required')
    .max(100, 'Maximum 100 transactions per request'),
  categoryId: z.string().uuid('Invalid category ID'),
});

export type BulkReassignInput = z.infer<typeof bulkReassignSchema>;
