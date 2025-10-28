import { z } from 'zod';

/**
 * Validation schema for account creation
 * FR-029: Create account
 * US-ACC-01: Track transactions across multiple accounts
 */
export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long (max 50 characters)').trim(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)')
    .optional()
    .default('#6b7280'),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

/**
 * Validation schema for account update
 * FR-030: Edit account (name and color only)
 */
export const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').trim().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
