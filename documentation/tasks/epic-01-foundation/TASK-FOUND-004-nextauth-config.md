# TASK-FOUND-004 - Configure NextAuth.js with Credentials Provider

## Context & Goal

**Business Value:** Enable authentication framework for secure user login and session management  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** FR-001 to FR-006, NF-010 to NF-014 (Security)

## Scope Definition

**✅ In Scope:**

- NextAuth.js installation and configuration
- Credentials provider setup (email/password)
- Session strategy (JWT)
- Secure cookie configuration (HttpOnly, Secure, SameSite)
- NextAuth API route handler
- Auth configuration file in `/lib/auth.ts`

**⛔ Out of Scope:**

- Actual signup/login route implementation (EPIC-02 tasks)
- Password hashing logic (TASK-AUTH-001)
- Protected route middleware (TASK-AUTH-003)
- Email providers (V1.1)
- OAuth providers (V2)

## Technical Specifications

**Implementation Details:**

- Install NextAuth: `npm install next-auth`
- Create `/app/api/auth/[...nextauth]/route.ts`:

  ```typescript
  import NextAuth from 'next-auth';
  import { authOptions } from '@/lib/auth';

  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
  ```

- Create `/lib/auth.ts` with configuration:

  ```typescript
  import type { NextAuthOptions } from 'next-auth';
  import CredentialsProvider from 'next-auth/providers/credentials';
  import { PrismaAdapter } from '@next-auth/prisma-adapter';
  import { db } from '@/lib/db';

  export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          // Implementation in TASK-AUTH-001
          return null;
        },
      }),
    ],
    session: {
      strategy: 'jwt',
      maxAge: 24 * 60 * 60, // 24 hours
    },
    cookies: {
      sessionToken: {
        name: 'budgetbuddy.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
    pages: {
      signIn: '/login',
      signOut: '/login',
      error: '/login',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  };
  ```

- Configure environment variables:
  ```
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=<generated-secret>
  ```

**Architecture References:**

- NextAuth.js documentation: https://next-auth.js.org/
- PRD NF-011: Cookie security requirements
- PRD NF-013: Rate limiting (separate task)

## Acceptance Criteria

1. **Given** NextAuth configured
   **When** navigating to /api/auth/signin
   **Then** NextAuth sign-in page displays

2. **Given** session strategy is JWT
   **When** user logs in (future task)
   **Then** session token is JWT, not database session

3. **Given** cookie configuration
   **When** inspecting Set-Cookie headers in production
   **Then** HttpOnly, Secure, SameSite=Lax flags are present

4. **Given** session maxAge 24 hours
   **When** user logs in
   **Then** session expires after 24 hours

5. **Given** custom sign-in page configured
   **When** unauthenticated user accesses protected route
   **Then** redirected to /login (not default NextAuth page)

## Definition of Done

- [ ] NextAuth.js installed and configured
- [ ] Credentials provider registered
- [ ] authOptions configured in /lib/auth.ts
- [ ] API route handler created at /api/auth/[...nextauth]
- [ ] Session strategy set to JWT with 24h expiration
- [ ] Cookie security flags configured (HttpOnly, Secure, SameSite)
- [ ] NEXTAUTH_SECRET generated and added to .env
- [ ] Custom pages configured (/login, /signup)
- [ ] JWT and session callbacks implemented
- [ ] Configuration tested with NextAuth default UI

## Dependencies

**Upstream Tasks:** TASK-FOUND-003 (Database + Prisma)  
**External Dependencies:** NextAuth.js, @next-auth/prisma-adapter  
**Parallel Tasks:** TASK-FOUND-001, TASK-FOUND-002  
**Downstream Impact:** All authentication tasks in EPIC-02

## Resources & References

**Design Assets:** N/A (configuration)  
**Technical Docs:**

- NextAuth.js: https://next-auth.js.org/
- NextAuth with Prisma: https://next-auth.js.org/adapters/prisma
  **PRD References:** FR-001 to FR-006, NF-010 to NF-014  
  **SAS References:** TBD (auth architecture)

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- NextAuth installation: 0.5 hours
- Configuration setup: 2-3 hours
- Cookie security + JWT config: 1-2 hours
- Testing with default UI: 1 hour

**Priority:** P0 (Must-have - blocks authentication features)  
**Risk Level:** Low (well-documented library)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Security review)  
**Stakeholder:** Engineering Lead
