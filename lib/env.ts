import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all required environment variables at application startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Feature Flags
  ENABLE_BUDGETS: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  ENABLE_RECURRING: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  ENABLE_CSV_EXPORT: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  ENABLE_ATTACHMENTS: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),

  // Optional: Error Tracking
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENV: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
});

/**
 * Validated environment variables
 * Use this throughout the application for type-safe environment access
 */
export const env = envSchema.parse(process.env);

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;
