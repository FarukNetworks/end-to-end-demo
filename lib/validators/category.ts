import { z } from 'zod';
import { CategoryType } from '@prisma/client';

/**
 * Validation schema for category creation
 * FR-019: Create custom categories
 * FR-020: Unique name validation (case-insensitive)
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long (max 50 characters)').trim(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)')
    .optional()
    .default('#22c55e'),
  type: z.nativeEnum(CategoryType, {
    message: 'Type must be expense or income',
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Validation schema for category update
 * FR-021: Edit category (name and color only, type immutable)
 * FR-020: Unique name validation (case-insensitive)
 */
export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').trim().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
