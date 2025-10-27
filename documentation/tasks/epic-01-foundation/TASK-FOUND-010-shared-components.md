# TASK-FOUND-010 - Create Shared UI Components (Toast, Loading, Error Boundary)

## Context & Goal

**Business Value:** Provide consistent feedback mechanisms and error handling across the application (UX-011, UX-012, NF-029)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** UX-011 (Toast notifications), UX-012 (Loading states), NF-029 (Error tracking)

## Scope Definition

**✅ In Scope:**

- Toast notification system with success/error/info variants
- Global toast provider and hook
- Skeleton loading components for common patterns
- Error boundary component with fallback UI
- Loading spinner component
- Empty state component template

**⛔ Out of Scope:**

- Feature-specific components (handled in epic tasks)
- Complex loading states (feature-specific)
- Undo functionality in toasts (V1.1)

## Technical Specifications

**Implementation Details:**

- Configure shadcn/ui toast (if not already added):

  ```bash
  npx shadcn-ui@latest add toast
  ```

- Create toast utilities in `/lib/toast.ts`:

  ```typescript
  import { toast as sonnerToast } from 'sonner';

  export const toast = {
    success: (message: string) => {
      sonnerToast.success(message, {
        duration: 3000,
      });
    },

    error: (message: string) => {
      sonnerToast.error(message, {
        duration: 4000,
      });
    },

    info: (message: string) => {
      sonnerToast.info(message, {
        duration: 3000,
      });
    },

    loading: (message: string) => {
      return sonnerToast.loading(message);
    },

    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },
  };
  ```

- Create Error Boundary in `/components/error-boundary.tsx`:

  ```typescript
  'use client';

  import { Component, ReactNode } from 'react';
  import { Button } from '@/components/ui/button';

  interface Props {
    children: ReactNode;
    fallback?: ReactNode;
  }

  interface State {
    hasError: boolean;
    error?: Error;
  }

  export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
      return {
        hasError: true,
        error,
      };
    }

    componentDidCatch(error: Error, errorInfo: any) {
      console.error('Error caught by boundary:', error, errorInfo);
      // TODO: Send to error tracking service (Sentry, etc.)
    }

    render() {
      if (this.state.hasError) {
        if (this.props.fallback) {
          return this.props.fallback;
        }

        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
            <h2 className="mb-2 text-2xl font-semibold">
              Something went wrong
            </h2>
            <p className="mb-4 text-muted-foreground">
              We're sorry for the inconvenience. Please try again.
            </p>
            <Button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
            >
              Try again
            </Button>
          </div>
        );
      }

      return this.props.children;
    }
  }
  ```

- Create Loading Spinner in `/components/ui/spinner.tsx`:

  ```typescript
  import { cn } from '@/lib/utils';

  interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }

  export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };

    return (
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-primary border-t-transparent',
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
  ```

- Create Empty State component in `/components/empty-state.tsx`:

  ```typescript
  import { ReactNode } from 'react';
  import { Button } from '@/components/ui/button';

  interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  }

  export function EmptyState({
    title,
    description,
    icon,
    action,
  }: EmptyStateProps) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && <Button onClick={action.onClick}>{action.label}</Button>}
      </div>
    );
  }
  ```

- Update root layout to include Toaster in `/app/layout.tsx`:

  ```typescript
  import { Toaster } from 'sonner';

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body>
          {children}
          <Toaster position="bottom-center" />
        </body>
      </html>
    );
  }
  ```

**Architecture References:**

- shadcn/ui Toast: https://ui.shadcn.com/docs/components/toast
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

## Acceptance Criteria

1. **Given** toast.success() called
   **When** rendering page
   **Then** green toast appears at bottom-center for 3 seconds

2. **Given** toast.error() called
   **When** displaying message
   **Then** red toast appears for 4 seconds

3. **Given** ErrorBoundary wrapping component that throws error
   **When** error occurs
   **Then** fallback UI displays with "Try again" button

4. **Given** Spinner component
   **When** rendering with size="lg"
   **Then** large spinner displays with correct ARIA attributes

5. **Given** EmptyState component with action
   **When** clicking action button
   **Then** onClick handler fires

## Definition of Done

- [ ] Toast notification system configured (sonner or shadcn/ui toast)
- [ ] Toast utility functions created (success, error, info, loading)
- [ ] Toaster component added to root layout
- [ ] ErrorBoundary class component created
- [ ] Error boundary fallback UI implemented
- [ ] Spinner component with size variants created
- [ ] EmptyState component created
- [ ] All components have proper ARIA attributes
- [ ] Components documented with usage examples
- [ ] Integration tested in dev environment

## Dependencies

**Upstream Tasks:** TASK-FOUND-002 (shadcn/ui)  
**External Dependencies:** sonner (or shadcn/ui toast)  
**Parallel Tasks:** Other foundation tasks  
**Downstream Impact:** All features use these components

## Resources & References

**Design Assets:** N/A (generic UI patterns)  
**Technical Docs:**

- Sonner: https://sonner.emilkowal.ski/
- React Error Boundaries: https://react.dev/reference/react/Component

**PRD References:** UX-011, UX-012, NF-029  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 4 story points (5-7 hours)

- Toast setup: 1.5 hours
- Error boundary: 1.5 hours
- Spinner component: 1 hour
- Empty state: 1 hour
- Testing: 1-2 hours

**Priority:** P0 (Must-have - needed across all features)  
**Risk Level:** Low (standard patterns)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (UI testing)  
**Stakeholder:** Design Lead
