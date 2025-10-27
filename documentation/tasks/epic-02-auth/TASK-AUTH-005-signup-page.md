# TASK-AUTH-005 - Create Signup Page with Form Validation

## Context & Goal

**Business Value:** Provide user-friendly signup interface to onboard new users (FR-001, UX-004)  
**Epic:** EPIC-02 Authentication & User Management  
**User Story:** US-AUTH-01 - As a new user, I want to register with email/password  
**PRD Reference:** FR-001 (Signup form), UX-004 (Form validation)

## Scope Definition

**✅ In Scope:**

- Signup page at `/signup` route
- Signup form with email, password, name (optional) fields
- Client-side validation with React Hook Form + Zod
- Form submission to `/api/auth/signup`
- Success redirect to `/login` or auto-login
- Error handling and display
- Link to login page for existing users

**⛔ Out of Scope:**

- Social signup (V2)
- Email verification (V1.1)
- Password strength indicator (V1.1)
- Terms of service checkbox (V1.1)

## Technical Specifications

**Implementation Details:**

- Create signup page in `/app/signup/page.tsx`:

  ```typescript
  import { SignupForm } from '@/components/auth/signup-form';
  import Link from 'next/link';

  export const metadata = {
    title: 'Sign Up - BudgetBuddy',
    description: 'Create your BudgetBuddy account',
  };

  export default function SignupPage() {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Start tracking your finances in minutes
            </p>
          </div>
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }
  ```

- Create signup form component in `/components/auth/signup-form.tsx`:

  ```typescript
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { toast } from '@/lib/toast';

  const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
  });

  type SignupFormData = z.infer<typeof signupSchema>;

  export function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SignupFormData>({
      resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Signup failed');
        }

        toast.success('Account created successfully!');
        router.push('/login');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create account'
        );
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            {...register('name')}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    );
  }
  ```

**Architecture References:**

- React Hook Form: https://react-hook-form.com/
- PRD FR-001: Signup form requirements
- PRD UX-004: Form validation patterns

## Acceptance Criteria

1. **Given** user navigates to /signup
   **When** page loads
   **Then** signup form displays with email, password, name fields

2. **Given** invalid email format
   **When** user submits form
   **Then** validation error "Invalid email address" displays

3. **Given** password <8 characters
   **When** user submits form
   **Then** validation error "Password must be at least 8 characters" displays

4. **Given** valid form data
   **When** user submits form
   **Then** POST to /api/auth/signup and redirect to /login on success

5. **Given** duplicate email (409 error from API)
   **When** user submits form
   **Then** error toast displays "Email already registered"

6. **Given** form submission in progress
   **When** checking button state
   **Then** button is disabled and shows "Creating account..." text

## Definition of Done

- [ ] /signup page created with metadata
- [ ] SignupForm component implemented
- [ ] React Hook Form + Zod validation configured
- [ ] All form fields with labels and error display
- [ ] API call to /api/auth/signup on submit
- [ ] Success redirects to /login with toast
- [ ] Error handling with toast notifications
- [ ] Loading state during submission
- [ ] Link to /login for existing users
- [ ] Accessibility (ARIA attributes, keyboard navigation)
- [ ] Responsive design (mobile/desktop)
- [ ] Integration test for signup flow

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-005 (Form validation setup)
- TASK-AUTH-001 (Signup API endpoint)
- TASK-FOUND-010 (Toast notifications)

**External Dependencies:** react-hook-form, zod  
**Parallel Tasks:** TASK-AUTH-006 (Login page)  
**Downstream Impact:** New users can create accounts

## Resources & References

**Design Assets:** TBD (Signup page mockup)  
**Technical Docs:**

- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/

**PRD References:** FR-001, UX-004  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Page structure: 1 hour
- Form component: 2-3 hours
- Validation logic: 1.5 hours
- Error handling: 1 hour
- Testing: 1.5-2 hours

**Priority:** P0 (Must-have - user onboarding)  
**Risk Level:** Low (standard form pattern)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Form validation testing)  
**Stakeholder:** Product Manager
