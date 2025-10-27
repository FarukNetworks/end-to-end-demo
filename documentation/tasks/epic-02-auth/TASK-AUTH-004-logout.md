# TASK-AUTH-004 - Implement Logout Functionality

## Context & Goal

**Business Value:** Enable users to securely end their session and protect their data (FR-005)  
**Epic:** EPIC-02 Authentication & User Management  
**PRD Reference:** FR-005 (Logout with session invalidation)

## Scope Definition

**✅ In Scope:**

- Logout button in UI (header/navigation)
- NextAuth signOut() integration
- Session invalidation
- Redirect to /login after logout
- Clear client-side session state

**⛔ Out of Scope:**

- Logout from all devices (V1.1)
- Session timeout (V1.1)
- Remember me / stay logged in (V1.1)

## Technical Specifications

**Implementation Details:**

- Create logout button component in `/components/auth/logout-button.tsx`:

  ```typescript
  'use client';

  import { signOut } from 'next-auth/react';
  import { Button } from '@/components/ui/button';
  import { LogOut } from 'lucide-react';

  export function LogoutButton() {
    const handleLogout = async () => {
      await signOut({
        callbackUrl: '/login',
        redirect: true,
      });
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    );
  }
  ```

- Add logout button to navigation in `/components/layout/header.tsx`:

  ```typescript
  import { LogoutButton } from '@/components/auth/logout-button';
  import { requireAuth } from '@/lib/auth-helpers';

  export async function Header() {
    const user = await requireAuth();

    return (
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">BudgetBuddy</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
    );
  }
  ```

- NextAuth configuration already handles signOut in TASK-FOUND-004

**Architecture References:**

- NextAuth signOut: https://next-auth.js.org/getting-started/client#signout
- PRD FR-005: Logout requirements

## Acceptance Criteria

1. **Given** authenticated user
   **When** clicking logout button
   **Then** session is invalidated and user redirected to /login

2. **Given** user logged out
   **When** attempting to access protected route
   **Then** redirect to /login (session no longer valid)

3. **Given** user logged out
   **When** checking session
   **Then** session returns null

4. **Given** logout in progress
   **When** button clicked
   **Then** button shows loading state (disabled)

5. **Given** successful logout
   **When** checking session cookie
   **Then** cookie is cleared from browser

## Definition of Done

- [ ] LogoutButton component created
- [ ] signOut from next-auth/react integrated
- [ ] Logout redirects to /login
- [ ] Session invalidated on logout
- [ ] Session cookie cleared
- [ ] Button added to header/navigation
- [ ] Loading state during logout
- [ ] Integration test for logout flow
- [ ] Protected routes inaccessible after logout

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-004 (NextAuth config)
- TASK-AUTH-002 (Login - to test logout)
- TASK-AUTH-003 (Protected routes)

**External Dependencies:** next-auth  
**Parallel Tasks:** TASK-AUTH-005, TASK-AUTH-006  
**Downstream Impact:** All protected pages use header with logout

## Resources & References

**Design Assets:** TBD (Header design)  
**Technical Docs:**

- NextAuth Client: https://next-auth.js.org/getting-started/client

**PRD References:** FR-005  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 2 story points (2-4 hours)

- LogoutButton component: 1 hour
- Header integration: 0.5 hours
- Testing: 1 hour
- Documentation: 0.5 hours

**Priority:** P0 (Must-have - security feature)  
**Risk Level:** Low (standard logout flow)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Integration testing)  
**Stakeholder:** Product Manager
