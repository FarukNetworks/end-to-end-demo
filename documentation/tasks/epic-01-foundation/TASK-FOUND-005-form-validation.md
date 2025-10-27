# TASK-FOUND-005 - Setup Form Validation with React Hook Form + Zod

## Context & Goal

**Business Value:** Establish consistent form validation framework to ensure data quality and user experience across all forms  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 9 (Forms: React Hook Form + Zod resolver), UX-004 (Form validation)

## Scope Definition

**✅ In Scope:**

- React Hook Form installation and configuration
- Zod schema validation library setup
- @hookform/resolvers for Zod integration
- Reusable form wrapper components
- Error display patterns
- Form state management patterns
- Example usage documentation

**⛔ Out of Scope:**

- Specific form implementations (handled in feature tasks)
- Backend validation (separate from client-side)
- File upload forms (V1.1)

## Technical Specifications

**Implementation Details:**

- Install dependencies:

  ```bash
  npm install react-hook-form zod @hookform/resolvers
  ```

- Create form utilities in `/lib/form-utils.ts`:

  ```typescript
  import { UseFormReturn } from 'react-hook-form';
  import { z } from 'zod';

  export function getErrorMessage(
    form: UseFormReturn<any>,
    fieldName: string
  ): string | undefined {
    const error = form.formState.errors[fieldName];
    return error?.message as string | undefined;
  }

  export function hasError(
    form: UseFormReturn<any>,
    fieldName: string
  ): boolean {
    return !!form.formState.errors[fieldName];
  }
  ```

- Create reusable Form component wrapper in `/components/ui/form.tsx`:

  ```typescript
  'use client';

  import { zodResolver } from '@hookform/resolvers/zod';
  import { useForm, UseFormReturn, FormProvider } from 'react-hook-form';
  import { z } from 'zod';
  import { cn } from '@/lib/utils';

  interface FormProps<T extends z.ZodType<any, any>> {
    schema: T;
    onSubmit: (data: z.infer<T>) => void | Promise<void>;
    defaultValues?: Partial<z.infer<T>>;
    children: (form: UseFormReturn<z.infer<T>>) => React.ReactNode;
    className?: string;
  }

  export function Form<T extends z.ZodType<any, any>>({
    schema,
    onSubmit,
    defaultValues,
    children,
    className,
  }: FormProps<T>) {
    const form = useForm<z.infer<T>>({
      resolver: zodResolver(schema),
      defaultValues: defaultValues as any,
    });

    return (
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('space-y-6', className)}
        >
          {children(form)}
        </form>
      </FormProvider>
    );
  }
  ```

- Create FormField component:

  ```typescript
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { UseFormReturn } from 'react-hook-form';
  import { getErrorMessage, hasError } from '@/lib/form-utils';

  interface FormFieldProps {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }

  export function FormField({
    form,
    name,
    label,
    type = 'text',
    placeholder,
  }: FormFieldProps) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          {...form.register(name)}
          aria-invalid={hasError(form, name)}
          aria-describedby={hasError(form, name) ? `${name}-error` : undefined}
        />
        {hasError(form, name) && (
          <p
            id={`${name}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {getErrorMessage(form, name)}
          </p>
        )}
      </div>
    );
  }
  ```

**Architecture References:**

- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- PRD UX-004: Form validation requirements

## Acceptance Criteria

1. **Given** React Hook Form and Zod installed
   **When** importing in a component
   **Then** no TypeScript errors and libraries work correctly

2. **Given** a Zod schema with validation rules
   **When** form is submitted with invalid data
   **Then** validation errors display inline below fields

3. **Given** form with required field left empty
   **When** user attempts to submit
   **Then** error message displays "Field is required" or custom message

4. **Given** form field with error
   **When** user corrects the input
   **Then** error message clears immediately (real-time validation)

5. **Given** form submission in progress
   **When** checking form state
   **Then** isSubmitting flag is true and submit button can be disabled

## Definition of Done

- [ ] React Hook Form, Zod, and @hookform/resolvers installed
- [ ] Form wrapper component created with TypeScript generics
- [ ] FormField component created for common inputs
- [ ] Form utilities (getErrorMessage, hasError) implemented
- [ ] Example form created in Storybook or documentation
- [ ] Real-time validation working (on blur and on change)
- [ ] Error messages display with proper ARIA attributes
- [ ] TypeScript types inferred from Zod schemas
- [ ] Documentation updated with usage examples
- [ ] No console errors when using forms

## Dependencies

**Upstream Tasks:** TASK-FOUND-002 (shadcn/ui components)  
**External Dependencies:** react-hook-form, zod, @hookform/resolvers  
**Parallel Tasks:** TASK-FOUND-003 (Database)  
**Downstream Impact:** All form tasks (AUTH-005, AUTH-006, TXN-007, CAT-008, ACC-008)

## Resources & References

**Design Assets:** N/A (form framework)  
**Technical Docs:**

- React Hook Form: https://react-hook-form.com/
- Zod validation: https://zod.dev/
- shadcn/ui Form: https://ui.shadcn.com/docs/components/form

**PRD References:** Section 9 (Forms), UX-004 (Form validation)  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- Library installation: 0.5 hours
- Form wrapper component: 2 hours
- FormField components: 1.5 hours
- Testing and documentation: 1-2 hours

**Priority:** P0 (Must-have - blocks all form implementations)  
**Risk Level:** Low (well-documented libraries)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Form validation testing)  
**Stakeholder:** Engineering Lead
