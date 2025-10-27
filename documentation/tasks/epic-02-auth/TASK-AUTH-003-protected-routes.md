# TASK-AUTH-003 - Create Protected Route Middleware

## Context & Goal

**Business Value:** Ensure only authenticated users can access protected pages and APIs (FR-006, NF-014)  
**Epic:** EPIC-02 Authentication & User Management  
**PRD Reference:** FR-006 (Protected routes), NF-014 (User scoping)

## Scope Definition

**✅ In Scope:**

- Next.js middleware for route protection
- Session validation on protected routes
- Redirect to /login for unauthenticated users
- Return URL preservation (redirect back after login)
- API route protection pattern
- Server component auth helper functions

**⛔ Out of Scope:**

- Role-based access control (V2)
- Fine-grained permissions (V2)
- Client-side route guards (Server-side only for security)

## Technical Specifications

**Implementation Details:**

- Create `/middleware.ts` in project root:

  ```typescript
  import { withAuth } from 'next-auth/middleware';
  import { NextResponse } from 'next/server';

  export default withAuth(
    function middleware(req) {
      // Middleware logic here if needed
      return NextResponse.next();
    },
    {
      callbacks: {
        authorized({ token }) {
          // Return true if token exists (user is authenticated)
          return !!token;
        },
      },
      pages: {
        signIn: '/login',
      },
    }
  );

  export const config = {
    matcher: [
      /*
       * Match all request paths except:
       * - /login, /signup (auth pages)
       * - /api/auth/* (NextAuth endpoints)
       * - /_next/* (Next.js internals)
       * - /favicon.ico, /sitemap.xml (static files)
       */
      '/((?!login|signup|api/auth|_next|favicon.ico|sitemap.xml).*)',
    ],
  };
  ```

- Create auth helper in `/lib/auth-helpers.ts`:

  ```typescript
  import { getServerSession } from 'next-auth';
  import { authOptions } from '@/lib/auth';
  import { redirect } from 'next/navigation';

  export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect('/login');
    }

    return session.user;
  }

  export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
  }
  ```

- Create API route protection helper in `/lib/api-auth.ts`:

  ```typescript
  import { getServerSession } from 'next-auth';
  import { authOptions } from '@/lib/auth';
  import { NextResponse } from 'next/server';

  export async function requireApiAuth() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        error: NextResponse.json(
          {
            error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          },
          { status: 401 }
        ),
        user: null,
      };
    }

    return {
      error: null,
      user: session.user,
    };
  }
  ```

- Example usage in Server Component:

  ```typescript
  // app/dashboard/page.tsx
  import { requireAuth } from '@/lib/auth-helpers';

  export default async function DashboardPage() {
    const user = await requireAuth();

    return <div>Welcome, {user.name}</div>;
  }
  ```

- Example usage in API route:

  ```typescript
  // app/api/transactions/route.ts
  import { requireApiAuth } from '@/lib/api-auth';

  export async function GET(req: Request) {
    const { error, user } = await requireApiAuth();
    if (error) return error;

    // User is authenticated, proceed with query
    // Always scope to user.id
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ data: transactions });
  }
  ```

**Architecture References:**

- PRD FR-006: Protected route middleware
- PRD NF-014: User scoping enforcement
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware

## Acceptance Criteria

1. **Given** unauthenticated user
   **When** navigating to /dashboard
   **Then** redirect to /login with ?from=/dashboard parameter

2. **Given** authenticated user
   **When** navigating to /dashboard
   **Then** page renders without redirect

3. **Given** unauthenticated user
   **When** making GET request to /api/transactions
   **Then** return 401 Unauthorized with error message

4. **Given** authenticated user
   **When** making GET request to /api/transactions
   **Then** return 200 with user's transactions only

5. **Given** successful login with ?from=/dashboard
   **When** login completes
   **Then** redirect to /dashboard (original destination)

6. **Given** public pages (/login, /signup)
   **When** unauthenticated user navigates
   **Then** page renders without redirect

## Definition of Done

- [ ] middleware.ts created with route protection
- [ ] Protected routes require authentication
- [ ] Public routes (/login, /signup) accessible without auth
- [ ] requireAuth helper implemented for Server Components
- [ ] requireApiAuth helper implemented for API routes
- [ ] Return URL preserved in redirect (from parameter)
- [ ] 401 errors returned for unauthenticated API requests
- [ ] All queries scoped to session.user.id
- [ ] Integration tests for protected routes
- [ ] Integration tests for API route protection
- [ ] Documentation updated with usage examples

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-004 (NextAuth config)
- TASK-AUTH-002 (Login functionality)

**External Dependencies:** next-auth, Next.js middleware  
**Parallel Tasks:** TASK-AUTH-004 (Logout)  
**Downstream Impact:** All protected pages and API routes

## Resources & References

**Design Assets:** N/A (middleware)  
**Technical Docs:**

- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- NextAuth Middleware: https://next-auth.js.org/configuration/nextjs#middleware

**PRD References:** FR-006, NF-014  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- Middleware implementation: 2 hours
- Auth helper functions: 1.5 hours
- Testing: 1.5-2 hours
- Documentation: 1 hour

**Priority:** P0 (Must-have - security critical)  
**Risk Level:** Medium (security implications)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead - security review)  
**QA Owner:** TBD (Security testing)  
**Stakeholder:** Engineering Lead
