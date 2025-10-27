# TASK-TEST-005 - Write E2E Test: Signup → Add Transaction → View Dashboard

## Context & Goal

**Business Value:** Validate critical user onboarding flow works end-to-end (Section 16)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (E2E: signup → add transaction → charts)

## Scope Definition

**✅ In Scope:**

- Complete new user onboarding flow
- Signup with email/password
- Add first transaction
- View transaction on dashboard
- Verify dashboard KPIs update

**⛔ Out of Scope:**

- Error scenarios (separate tests)

## Technical Specifications

```typescript
// /tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('new user can signup, add transaction, and view dashboard', async ({
  page,
}) => {
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';

  // Signup
  await page.goto('/signup');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="name"]', 'Test User');
  await page.click('button[type="submit"]');

  // Should redirect to login
  await page.waitForURL('/login');
  expect(await page.textContent('body')).toContain(
    'Account created successfully'
  );

  // Login
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Should redirect to dashboard
  await page.waitForURL('/');
  expect(await page.textContent('h1')).toContain('Dashboard');

  // Add transaction
  await page.click('button:has-text("Add Transaction")');
  await page.fill('input[name="amount"]', '45.50');
  await page.selectOption('select[name="categoryId"]', { index: 0 });
  await page.selectOption('select[name="accountId"]', { index: 0 });
  await page.fill('textarea[name="note"]', 'Test groceries');
  await page.click('button[type="submit"]');

  // Verify toast
  await expect(page.locator('text=Transaction added')).toBeVisible();

  // Verify dashboard updates
  await expect(page.locator('text=€45.50')).toBeVisible();
  await expect(page.locator('text=1')).toBeVisible(); // Transaction count

  // Verify charts render
  await expect(page.locator('canvas, svg').first()).toBeVisible();
});
```

## Acceptance Criteria

1. **Given** E2E test runs
   **When** completing flow
   **Then** user can signup, login, add transaction, see dashboard

2. **Given** transaction added
   **When** checking dashboard
   **Then** KPIs show correct values

3. **Given** test completion
   **When** checking assertions
   **Then** all assertions pass

## Definition of Done

- [ ] E2E test created
- [ ] Signup flow tested
- [ ] Login flow tested
- [ ] Add transaction tested
- [ ] Dashboard display tested
- [ ] Charts render verified
- [ ] Test passes consistently

## Dependencies

**Upstream:** TASK-TEST-004 (Playwright), AUTH-005, AUTH-006, TXN-008, DASH-004  
**Effort:** 6 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA Engineer)
