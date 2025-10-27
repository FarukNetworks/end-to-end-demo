import { describe, it, expect } from 'vitest';
import { signupSchema } from '@/lib/validators';
import { ZodError } from 'zod';

describe('Signup Validation Schema', () => {
  describe('Valid inputs', () => {
    it('should accept valid email and password (≥8 chars)', () => {
      const result = signupSchema.parse({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.email).toBe('user@example.com');
      expect(result.password).toBe('password123');
    });

    it('should accept valid email, password, and name', () => {
      const result = signupSchema.parse({
        email: 'john.doe@example.com',
        password: 'securePassword',
        name: 'John Doe',
      });

      expect(result.email).toBe('john.doe@example.com');
      expect(result.password).toBe('securePassword');
      expect(result.name).toBe('John Doe');
    });

    it('should accept password exactly 8 characters', () => {
      const result = signupSchema.parse({
        email: 'test@test.com',
        password: '12345678',
      });

      expect(result.password).toBe('12345678');
    });

    it('should accept empty name (optional field)', () => {
      const result = signupSchema.parse({
        email: 'test@test.com',
        password: 'password123',
        name: undefined,
      });

      expect(result.name).toBeUndefined();
    });
  });

  describe('Invalid email format', () => {
    it('should reject plain text without @', () => {
      expect(() => {
        signupSchema.parse({
          email: 'notanemail',
          password: 'password123',
        });
      }).toThrow(ZodError);
    });

    it('should reject email without domain', () => {
      expect(() => {
        signupSchema.parse({
          email: 'test@',
          password: 'password123',
        });
      }).toThrow(ZodError);
    });

    it('should reject email without local part', () => {
      expect(() => {
        signupSchema.parse({
          email: '@example.com',
          password: 'password123',
        });
      }).toThrow(ZodError);
    });

    it('should reject empty email', () => {
      expect(() => {
        signupSchema.parse({
          email: '',
          password: 'password123',
        });
      }).toThrow(ZodError);
    });
  });

  describe('Password length validation', () => {
    it('should reject password with 7 characters', () => {
      expect(() => {
        signupSchema.parse({
          email: 'test@example.com',
          password: '1234567',
        });
      }).toThrow(ZodError);
    });

    it('should reject password with 1 character', () => {
      expect(() => {
        signupSchema.parse({
          email: 'test@example.com',
          password: 'a',
        });
      }).toThrow(ZodError);
    });

    it('should reject empty password', () => {
      expect(() => {
        signupSchema.parse({
          email: 'test@example.com',
          password: '',
        });
      }).toThrow(ZodError);
    });

    it('should provide correct error message for short password', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]?.message).toBe('Password must be at least 8 characters');
      }
    });
  });

  describe('Missing required fields', () => {
    it('should reject missing email', () => {
      expect(() => {
        signupSchema.parse({
          password: 'password123',
        });
      }).toThrow(ZodError);
    });

    it('should reject missing password', () => {
      expect(() => {
        signupSchema.parse({
          email: 'test@example.com',
        });
      }).toThrow(ZodError);
    });

    it('should reject empty object', () => {
      expect(() => {
        signupSchema.parse({});
      }).toThrow(ZodError);
    });
  });

  describe('Error messages', () => {
    it('should provide correct error message for invalid email', () => {
      const result = signupSchema.safeParse({
        email: 'invalid',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]?.message).toBe('Invalid email format');
      }
    });
  });
});
