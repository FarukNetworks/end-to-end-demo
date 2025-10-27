# TASK-AUTH-006 - Create Login Page with Form Validation

## Context & Goal

**Business Value:** Provide user-friendly login interface for existing users to access their accounts (FR-003, UX-004)  
**Epic:** EPIC-02 Authentication & User Management  
**User Story:** US-AUTH-02 - As a registered user, I want to log in securely so I can access my data  
**PRD Reference:** FR-003 (Login form), UX-004 (Form validation)

## Scope Definition

**✅ In Scope:**

- Login page at `/login` route
- Login form with email and password fields
- Client-side validation with React Hook Form + Zod
- Form submission via NextAuth signIn()
- Error handling for invalid credentials
- Success redirect to dashboard or return URL
- Link to signup page for new users

**⛔ Out of Scope:**

- Password reset link (V1.1)
- Remember me checkbox (V1.1)
- Social login buttons (V2)

## Technical Specifications

**Implementation Details:**

- Create login page in `/app/login/page.tsx`:

  ```typescript
  import { LoginForm } from '@/components/auth/login-form';
  import Link from 'next/link';

  export const metadata = {
    title: 'Log In - BudgetBuddy',
    description: 'Log in to your BudgetBuddy account',
  };

  export default function LoginPage() {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Log in to your account to continue
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    );
  }
  ```

- Create login form component in `/components/auth/login-form.tsx`:

  ```typescript
  'use client';

  import { useState } from 'react';
  import { useRouter, useSearchParams } from 'next/navigation';
  import { signIn } from 'next-auth/react';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { toast } from '@/lib/toast';

  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const from = searchParams.get('from') || '/';

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) {
      setIsLoading(true);

      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Invalid email or password');
          return;
        }

        if (result?.ok) {
          toast.success('Logged in successfully!');
          router.push(from);
          router.refresh();
        }
      } catch (error) {
        toast.error('Failed to log in. Please try again.');
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
            autoComplete="email"
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
            autoComplete="current-password"
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    );
  }
  ```

**Architecture References:**

- NextAuth signIn: https://next-auth.js.org/getting-started/client#signin
- PRD FR-003: Login requirements

## Acceptance Criteria

1. **Given** user navigates to /login
   **When** page loads
   **Then** login form displays with email and password fields

2. **Given** invalid email format
   **When** user submits form
   **Then** validation error "Invalid email address" displays

3. **Given** empty password field
   **When** user submits form
   **Then** validation error "Password is required" displays

4. **Given** valid credentials
   **When** user submits form
   **Then** signIn succeeds and redirects to dashboard

5. **Given** invalid credentials (wrong password)
   **When** user submits form
   **Then** error toast "Invalid email or password" displays

6. **Given** /login?from=/transactions
   **When** login succeeds
   **Then** redirect to /transactions (not dashboard)

7. **Given** form submission in progress
   **When** checking button state
   **Then** button is disabled and shows "Logging in..." text

## Definition of Done

- [ ] /login page created with metadata
- [ ] LoginForm component implemented
- [ ] React Hook Form + Zod validation configured
- [ ] NextAuth signIn() integration
- [ ] Email and password fields with labels and errors
- [ ] Success redirects to dashboard or return URL
- [ ] Error handling with toast notifications
- [ ] Loading state during submission
- [ ] Link to /signup for new users
- [ ] Accessibility (ARIA attributes, autocomplete)
- [ ] Responsive design (mobile/desktop)
- [ ] Integration test for login flow

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-005 (Form validation)
- TASK-AUTH-002 (Login endpoint)
- TASK-FOUND-010 (Toast notifications)
- TASK-FOUND-004 (NextAuth config)

**External Dependencies:** next-auth, react-hook-form, zod  
**Parallel Tasks:** TASK-AUTH-005 (Signup page)  
**Downstream Impact:** Users can access protected pages

## Resources & References

**Design Assets:** TBD (Login page mockup)  
**Technical Docs:**

- NextAuth Client: https://next-auth.js.org/getting-started/client

**PRD References:** FR-003, FR-004, UX-004  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Page structure: 1 hour
- Form component: 2-3 hours
- NextAuth integration: 1.5 hours
- Error handling: 1 hour
- Testing: 1.5-2 hours

**Priority:** P0 (Must-have - user authentication)  
**Risk Level:** Low (standard form pattern)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Form validation testing)  
**Stakeholder:** Product Manager
