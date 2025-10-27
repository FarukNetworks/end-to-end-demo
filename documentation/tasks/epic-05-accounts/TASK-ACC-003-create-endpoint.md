# TASK-ACC-003 - Implement POST /api/accounts Endpoint

## Context & Goal

**Business Value:** Enable users to create custom accounts (FR-029, US-010)  
**Epic:** EPIC-05 Account Management  
**User Story:** US-ACC-01 - Track transactions across multiple accounts  
**PRD Reference:** FR-029 (Create account)

## Scope Definition

**✅ In Scope:**

- POST /api/accounts endpoint
- Name and color validation
- Name uniqueness check (case-insensitive)
- User scoping

**⛔ Out of Scope:**

- Initial balance (V1.1)
- Account types (checking, savings) - V2

## Technical Specifications

```typescript
// /app/api/accounts/route.ts
export async function POST(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const { name, color } = createAccountSchema.parse(body);

  // Check duplicate name
  const existing = await db.account.findFirst({
    where: {
      userId: user.id,
      name: { equals: name, mode: 'insensitive' },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: 'DUPLICATE_NAME',
          message: 'Account name already exists',
        },
      },
      { status: 409 }
    );
  }

  const account = await db.account.create({
    data: {
      userId: user.id,
      name,
      color: color || '#6b7280',
    },
  });

  return NextResponse.json({ data: account }, { status: 201 });
}
```

```typescript
// /lib/validators/account.ts
import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1).max(50, 'Name too long'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional()
    .default('#6b7280'),
});

export const updateAccountSchema = createAccountSchema.partial();
```

## Acceptance Criteria

1. **Given** valid account data
   **When** POST /api/accounts
   **Then** return 201 with created account

2. **Given** duplicate name (case-insensitive)
   **When** POST
   **Then** return 409 "Account name already exists"

3. **Given** no color provided
   **When** POST
   **Then** default color #6b7280 applied

## Definition of Done

- [ ] POST endpoint implemented
- [ ] Validation schema created
- [ ] Name uniqueness check
- [ ] Default color applied
- [ ] User scoping
- [ ] Integration tests passing

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-FOUND-003  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Backend Engineer)
