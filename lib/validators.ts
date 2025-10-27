import { z } from 'zod';

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
