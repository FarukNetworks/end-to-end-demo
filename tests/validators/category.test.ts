import { describe, it, expect } from 'vitest';
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/lib/validators/category';
import { CategoryType } from '@prisma/client';
import { ZodError } from 'zod';

describe('Category Validation Schemas', () => {
  describe('createCategorySchema', () => {
    describe('Valid inputs', () => {
      it('should accept valid category with all fields', () => {
        const result = createCategorySchema.parse({
          name: 'Groceries',
          color: '#FF5733',
          type: CategoryType.expense,
        });

        expect(result.name).toBe('Groceries');
        expect(result.color).toBe('#FF5733');
        expect(result.type).toBe(CategoryType.expense);
      });

      it('should accept category without color (uses default)', () => {
        const result = createCategorySchema.parse({
          name: 'Salary',
          type: CategoryType.income,
        });

        expect(result.name).toBe('Salary');
        expect(result.color).toBe('#22c55e');
        expect(result.type).toBe(CategoryType.income);
      });

      it('should accept expense type', () => {
        const result = createCategorySchema.parse({
          name: 'Food',
          type: CategoryType.expense,
        });

        expect(result.type).toBe(CategoryType.expense);
      });

      it('should accept income type', () => {
        const result = createCategorySchema.parse({
          name: 'Freelance',
          type: CategoryType.income,
        });

        expect(result.type).toBe(CategoryType.income);
      });

      it('should accept valid hex color #FF5733', () => {
        const result = createCategorySchema.parse({
          name: 'Transport',
          color: '#FF5733',
          type: CategoryType.expense,
        });

        expect(result.color).toBe('#FF5733');
      });

      it('should accept lowercase hex color', () => {
        const result = createCategorySchema.parse({
          name: 'Transport',
          color: '#ff5733',
          type: CategoryType.expense,
        });

        expect(result.color).toBe('#ff5733');
      });

      it('should accept mixed case hex color', () => {
        const result = createCategorySchema.parse({
          name: 'Transport',
          color: '#Ff5733',
          type: CategoryType.expense,
        });

        expect(result.color).toBe('#Ff5733');
      });

      it('should accept name with exactly 50 characters', () => {
        const longName = 'a'.repeat(50);
        const result = createCategorySchema.parse({
          name: longName,
          type: CategoryType.expense,
        });

        expect(result.name).toBe(longName);
        expect(result.name.length).toBe(50);
      });

      it('should trim whitespace from name', () => {
        const result = createCategorySchema.parse({
          name: '  Groceries  ',
          type: CategoryType.expense,
        });

        expect(result.name).toBe('Groceries');
      });
    });

    describe('Name validation', () => {
      it('should reject empty name', () => {
        expect(() => {
          createCategorySchema.parse({
            name: '',
            type: CategoryType.expense,
          });
        }).toThrow('Name is required');
      });

      it('should reject empty name after trimming whitespace', () => {
        expect(() => {
          createCategorySchema.parse({
            name: '   ',
            type: CategoryType.expense,
          });
        }).toThrow('Name is required');
      });

      it('should reject name with 51 characters', () => {
        const tooLongName = 'a'.repeat(51);

        expect(() => {
          createCategorySchema.parse({
            name: tooLongName,
            type: CategoryType.expense,
          });
        }).toThrow('Name too long (max 50 characters)');
      });

      it('should reject name over 50 characters', () => {
        const tooLongName = 'a'.repeat(100);

        expect(() => {
          createCategorySchema.parse({
            name: tooLongName,
            type: CategoryType.expense,
          });
        }).toThrow('Name too long (max 50 characters)');
      });

      it('should reject missing name', () => {
        expect(() => {
          createCategorySchema.parse({
            type: CategoryType.expense,
          });
        }).toThrow(ZodError);
      });
    });

    describe('Color validation', () => {
      it('should reject invalid color #GGG', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            color: '#GGG',
            type: CategoryType.expense,
          });
        }).toThrow('Invalid color format (use #RRGGBB)');
      });

      it('should reject color without hash', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            color: 'FF5733',
            type: CategoryType.expense,
          });
        }).toThrow('Invalid color format (use #RRGGBB)');
      });

      it('should reject color with wrong length (too short)', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            color: '#FFF',
            type: CategoryType.expense,
          });
        }).toThrow('Invalid color format (use #RRGGBB)');
      });

      it('should reject color with wrong length (too long)', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            color: '#FFFFFFF',
            type: CategoryType.expense,
          });
        }).toThrow('Invalid color format (use #RRGGBB)');
      });

      it('should reject color with invalid characters', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            color: '#GGGGGG',
            type: CategoryType.expense,
          });
        }).toThrow('Invalid color format (use #RRGGBB)');
      });

      it('should reject color with spaces', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            color: '#FF 733',
            type: CategoryType.expense,
          });
        }).toThrow('Invalid color format (use #RRGGBB)');
      });
    });

    describe('Type validation', () => {
      it('should reject invalid type', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            type: 'invalid',
          });
        }).toThrow('Type must be expense or income');
      });

      it('should reject missing type', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
          });
        }).toThrow(ZodError);
      });

      it('should reject null type', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            type: null,
          });
        }).toThrow(ZodError);
      });

      it('should reject undefined type', () => {
        expect(() => {
          createCategorySchema.parse({
            name: 'Food',
            type: undefined,
          });
        }).toThrow(ZodError);
      });
    });

    describe('Type inference', () => {
      it('should infer correct TypeScript type for CreateCategoryInput', () => {
        const input: CreateCategoryInput = {
          name: 'Test',
          type: CategoryType.expense,
        };

        expect(input.name).toBe('Test');
        expect(input.type).toBe(CategoryType.expense);
        // Color should be optional in input type but will have default after parse
      });
    });
  });

  describe('updateCategorySchema', () => {
    describe('Valid partial updates', () => {
      it('should accept update with only name', () => {
        const result = updateCategorySchema.parse({
          name: 'Updated Category',
        });

        expect(result.name).toBe('Updated Category');
        expect(result.color).toBeUndefined();
      });

      it('should accept update with only color', () => {
        const result = updateCategorySchema.parse({
          color: '#FF5733',
        });

        expect(result.color).toBe('#FF5733');
        expect(result.name).toBeUndefined();
      });

      it('should accept update with both name and color', () => {
        const result = updateCategorySchema.parse({
          name: 'Updated',
          color: '#FF5733',
        });

        expect(result.name).toBe('Updated');
        expect(result.color).toBe('#FF5733');
      });

      it('should accept empty object (all fields optional)', () => {
        const result = updateCategorySchema.parse({});

        expect(result).toEqual({});
      });

      it('should trim whitespace from name when provided', () => {
        const result = updateCategorySchema.parse({
          name: '  Updated Name  ',
        });

        expect(result.name).toBe('Updated Name');
      });

      it('should accept name with exactly 50 characters', () => {
        const longName = 'a'.repeat(50);
        const result = updateCategorySchema.parse({
          name: longName,
        });

        expect(result.name).toBe(longName);
        expect(result.name.length).toBe(50);
      });
    });

    describe('Name validation when provided', () => {
      it('should reject empty name when provided', () => {
        expect(() => {
          updateCategorySchema.parse({
            name: '',
          });
        }).toThrow('Name is required');
      });

      it('should reject empty name after trimming', () => {
        expect(() => {
          updateCategorySchema.parse({
            name: '   ',
          });
        }).toThrow('Name is required');
      });

      it('should reject name with 51 characters when provided', () => {
        const tooLongName = 'a'.repeat(51);

        expect(() => {
          updateCategorySchema.parse({
            name: tooLongName,
          });
        }).toThrow('Name too long');
      });

      it('should reject name over 50 characters when provided', () => {
        const tooLongName = 'a'.repeat(100);

        expect(() => {
          updateCategorySchema.parse({
            name: tooLongName,
          });
        }).toThrow('Name too long');
      });
    });

    describe('Color validation when provided', () => {
      it('should reject invalid color format when provided', () => {
        expect(() => {
          updateCategorySchema.parse({
            color: '#GGG',
          });
        }).toThrow('Invalid color format');
      });

      it('should reject color without hash when provided', () => {
        expect(() => {
          updateCategorySchema.parse({
            color: 'FF5733',
          });
        }).toThrow('Invalid color format');
      });

      it('should reject color with wrong length when provided', () => {
        expect(() => {
          updateCategorySchema.parse({
            color: '#FFF',
          });
        }).toThrow('Invalid color format');
      });

      it('should reject color with invalid characters when provided', () => {
        expect(() => {
          updateCategorySchema.parse({
            color: '#GGGGGG',
          });
        }).toThrow('Invalid color format');
      });

      it('should accept valid hex color when provided', () => {
        const result = updateCategorySchema.parse({
          color: '#FF5733',
        });

        expect(result.color).toBe('#FF5733');
      });

      it('should accept lowercase hex color when provided', () => {
        const result = updateCategorySchema.parse({
          color: '#ff5733',
        });

        expect(result.color).toBe('#ff5733');
      });
    });

    describe('Type immutability', () => {
      it('should not accept type field in update schema', () => {
        const result = updateCategorySchema.parse({
          name: 'Test',
          color: '#FF5733',
        });

        // Type field should not exist in update schema
        expect(result).not.toHaveProperty('type');
      });
    });

    describe('Type inference', () => {
      it('should infer correct TypeScript type for UpdateCategoryInput', () => {
        const input: UpdateCategoryInput = {
          name: 'Updated',
          color: '#FF5733',
        };

        expect(input.name).toBe('Updated');
        expect(input.color).toBe('#FF5733');
      });

      it('should allow partial updates in TypeScript', () => {
        const input: UpdateCategoryInput = {
          name: 'Only name',
        };

        expect(input.name).toBe('Only name');
      });
    });
  });
});
