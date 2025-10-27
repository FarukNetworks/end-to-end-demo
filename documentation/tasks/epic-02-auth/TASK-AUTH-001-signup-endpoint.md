# TASK-AUTH-001 - Implement User Signup API Endpoint

## Context & Goal

**Business Value:** Enable new users to create accounts with email/password authentication (FR-001, FR-002)  
**Epic:** EPIC-02 Authentication & User Management  
**User Story:** US-AUTH-01 - As a new user, I want to register with email/password so I can create my account  
**PRD Reference:** FR-001, FR-002, NF-010 (Password hashing)

## Scope Definition

**✅ In Scope:**

- POST /api/auth/signup endpoint implementation
- Email validation (format, uniqueness)
- Password strength validation (≥8 characters)
- Password hashing with bcrypt (10 rounds minimum)
- User creation in database
- Default categories and accounts creation on signup
- Error handling for duplicate emails (409 Conflict)
- Rate limiting (3 signups per IP per hour)

**⛔ Out of Scope:**

- Email verification (V1.1)
- Social signup (V2)
- Password reset (V1.1)
- User profile updates (separate task)

## Technical Specifications

**Implementation Details:**

- Create `/app/api/auth/signup/route.ts`:

  ```typescript
  import { NextResponse } from 'next/server';
  import bcrypt from 'bcryptjs';
  import { db } from '@/lib/db';
  import { signupSchema } from '@/lib/validators';
  import { createDefaultCategories } from '@/lib/seed/categories';
  import { createDefaultAccounts } from '@/lib/seed/accounts';

  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { email, password, name } = signupSchema.parse(body);

      // Check if user exists
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          {
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Email already registered',
            },
          },
          { status: 409 }
        );
      }

      // Hash password (10 rounds)
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user + default categories + accounts in transaction
      const user = await db.$transaction(async tx => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
          },
        });

        await createDefaultCategories(tx, newUser.id);
        await createDefaultAccounts(tx, newUser.id);

        return newUser;
      });

      return NextResponse.json(
        { user: { id: user.id, email: user.email, name: user.name } },
        { status: 201 }
      );
    } catch (error) {
      // Error handling
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Signup failed' } },
        { status: 500 }
      );
    }
  }
  ```

- Create Zod validation schema in `/lib/validators.ts`:

  ```typescript
  import { z } from 'zod';

  export const signupSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
  });
  ```

- Implement rate limiting middleware (reusable for other endpoints)

**Architecture References:**

- PRD FR-001, FR-002: Signup requirements
- PRD NF-010: Password hashing with bcrypt
- PRD NF-013: Rate limiting specification

## Acceptance Criteria

1. **Given** valid email and password (≥8 chars)
   **When** POST /api/auth/signup with { email, password, name }
   **Then** return 201 with user object (id, email, name)

2. **Given** email already exists in database
   **When** POST /api/auth/signup with duplicate email
   **Then** return 409 with error "Email already registered"

3. **Given** password < 8 characters
   **When** POST /api/auth/signup with short password
   **Then** return 400 with validation error

4. **Given** invalid email format
   **When** POST /api/auth/signup with "notanemail"
   **Then** return 400 with validation error "Invalid email format"

5. **Given** successful signup
   **When** querying database for user
   **Then** password is hashed (bcrypt), not plaintext

6. **Given** successful signup
   **When** querying categories and accounts for user
   **Then** 10 default categories and 2 default accounts exist

7. **Given** 3 signup attempts from same IP within 1 hour
   **When** 4th signup attempt
   **Then** return 429 Too Many Requests

## Definition of Done

- [ ] POST /api/auth/signup endpoint implemented
- [ ] Zod validation schema created and applied
- [ ] Email uniqueness check implemented
- [ ] Password hashing with bcrypt (10 rounds) implemented
- [ ] Default categories and accounts created on signup
- [ ] Database transaction ensures atomicity
- [ ] Error handling for all cases (duplicate email, validation, server errors)
- [ ] Rate limiting middleware implemented (3 per IP per hour)
- [ ] Unit tests for validation schema (>90% coverage)
- [ ] Integration test for signup flow
- [ ] API returns proper HTTP status codes
- [ ] Password never logged or returned in response

## Dependencies

**Upstream Tasks:**

- TASK-FOUND-003 (Database + Prisma)
- TASK-FOUND-004 (NextAuth config)
  **External Dependencies:** bcryptjs, zod  
  **Parallel Tasks:** TASK-AUTH-002 (Login endpoint)  
  **Downstream Impact:** Default categories/accounts available for all users

## Resources & References

**Design Assets:** N/A (API endpoint)  
**Technical Docs:**

- bcryptjs: https://www.npmjs.com/package/bcryptjs
- Zod: https://zod.dev/
  **PRD References:** FR-001, FR-002, NF-010, NF-013  
  **SAS References:** TBD (API architecture)

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Endpoint implementation: 2 hours
- Validation schema: 1 hour
- Password hashing: 1 hour
- Default categories/accounts integration: 2 hours
- Rate limiting: 1 hour
- Testing: 1-2 hours

**Priority:** P0 (Must-have - blocks user onboarding)  
**Risk Level:** Medium (security-critical endpoint)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead - security review)  
**QA Owner:** TBD (Integration testing)  
**Stakeholder:** Product Manager
