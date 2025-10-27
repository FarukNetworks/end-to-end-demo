# TASK-AUTH-002 - Implement User Login with NextAuth Credentials

## Context & Goal

**Business Value:** Enable existing users to securely log in and access their data (FR-003, FR-004)  
**Epic:** EPIC-02 Authentication & User Management  
**User Story:** US-AUTH-02 - As a registered user, I want to log in securely so I can access my data  
**PRD Reference:** FR-003, FR-004, NF-010 (Password verification)

## Scope Definition

**✅ In Scope:**

- NextAuth credentials authorize callback implementation
- Password verification with bcrypt
- User lookup by email
- Session creation with user ID in JWT
- Invalid credentials error handling (401)
- Session cookie configuration (already in FOUND-004)

**⛔ Out of Scope:**

- Login UI page (separate task AUTH-006)
- Password reset (V1.1)
- Account lockout after failed attempts (handled by rate limiting in AUTH-007)
- Remember me functionality (V1.1)

## Technical Specifications

**Implementation Details:**

- Update `/lib/auth.ts` authorize callback:

  ```typescript
  import bcrypt from 'bcryptjs';
  import { db } from '@/lib/db';
  import type { NextAuthOptions } from 'next-auth';
  import CredentialsProvider from 'next-auth/providers/credentials';

  export const authOptions: NextAuthOptions = {
    // ... existing config from FOUND-004
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Invalid credentials');
          }

          // Find user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user) {
            // Generic error to prevent email enumeration
            throw new Error('Invalid credentials');
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // Return user object (will be stored in JWT)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
        }
        return session;
      },
    },
  };
  ```

- Extend NextAuth types in `/types/next-auth.d.ts`:

  ```typescript
  import 'next-auth';

  declare module 'next-auth' {
    interface Session {
      user: {
        id: string;
        email: string;
        name?: string;
      };
    }

    interface User {
      id: string;
      email: string;
      name?: string;
    }
  }

  declare module 'next-auth/jwt' {
    interface JWT {
      id: string;
      email: string;
      name?: string;
    }
  }
  ```

**Architecture References:**

- PRD FR-003, FR-004: Login requirements
- PRD NF-010: Password verification with bcrypt
- NextAuth Credentials Provider: https://next-auth.js.org/providers/credentials

## Acceptance Criteria

1. **Given** valid email and password
   **When** POST /api/auth/signin (NextAuth) with correct credentials
   **Then** return 200, create session, set cookie, redirect to dashboard

2. **Given** valid email but wrong password
   **When** POST /api/auth/signin
   **Then** return 401 with error "Invalid credentials"

3. **Given** unregistered email
   **When** POST /api/auth/signin
   **Then** return 401 with error "Invalid credentials" (no email enumeration)

4. **Given** missing email or password
   **When** POST /api/auth/signin
   **Then** return 401 with error "Invalid credentials"

5. **Given** successful login
   **When** checking session
   **Then** session contains userId, email, name

6. **Given** successful login
   **When** inspecting cookies
   **Then** session cookie is HttpOnly, Secure (prod), SameSite=Lax

## Definition of Done

- [ ] NextAuth authorize callback implemented in /lib/auth.ts
- [ ] User lookup by email (case-insensitive) implemented
- [ ] Password verification with bcrypt implemented
- [ ] Session creation with user data in JWT
- [ ] Generic error messages prevent email enumeration
- [ ] NextAuth types extended for user session data
- [ ] Integration test for successful login
- [ ] Integration test for invalid credentials
- [ ] Integration test for missing credentials
- [ ] Session cookies configured securely (verified in browser)
- [ ] No password or hash logged anywhere

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-003 (Database + Prisma)
- TASK-FOUND-004 (NextAuth config)
- TASK-AUTH-001 (Users exist in database)

**External Dependencies:** bcryptjs, next-auth  
**Parallel Tasks:** TASK-AUTH-003 (Protected routes)  
**Downstream Impact:** All authenticated features depend on login

## Resources & References

**Design Assets:** N/A (API authentication)  
**Technical Docs:**

- NextAuth Credentials: https://next-auth.js.org/providers/credentials
- bcryptjs: https://www.npmjs.com/package/bcryptjs

**PRD References:** FR-003, FR-004, NF-010, NF-011  
**SAS References:** TBD (auth architecture)

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Authorize callback implementation: 2-3 hours
- Password verification: 1 hour
- Session callbacks: 1 hour
- Type extensions: 1 hour
- Testing: 1-2 hours

**Priority:** P0 (Must-have - blocks all authenticated features)  
**Risk Level:** Medium (security-critical endpoint)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead - security review)  
**QA Owner:** TBD (Integration testing)  
**Stakeholder:** Product Manager
