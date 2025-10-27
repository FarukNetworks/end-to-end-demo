# TASK-TEST-006 - Write E2E Test: Edit Transaction → Filter → Charts Render

## Context & Goal

**Business Value:** Validate transaction editing and filtering workflows (Section 16)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (E2E: edit → filter → charts)

## Scope Definition

**✅ In Scope:**

- Edit existing transaction
- Apply filters (date, category)
- Verify filtered results
- Verify charts update with filters

**⛔ Out of Scope:**

- All filter combinations (covered by integration tests)

## Technical Specifications

```typescript
// /tests/e2e/edit-and-filter.spec.ts
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test('user can edit transaction, filter, and view charts', async ({ page }) => {
  await login(page, 'test@example.com', 'password');

  // Navigate to transactions
  await page.goto('/transactions');

  // Click first transaction to edit
  await page.click('tbody tr:first-child');

  // Edit amount
  await page.fill('input[name="amount"]', '99.99');
  await page.fill('textarea[name="note"]', 'Updated note');
  await page.click('button:has-text("Save")');

  // Verify update toast
  await expect(page.locator('text=Transaction updated')).toBeVisible();

  // Verify updated values in list
  await expect(page.locator('text=€99.99')).toBeVisible();
  await expect(page.locator('text=Updated note')).toBeVisible();

  // Apply category filter
  await page.selectOption('select[name="categoryId"]', { index: 0 });
  await page.click('button:has-text("Apply")');

  // Verify URL updated
  expect(page.url()).toContain('categoryId=');

  // Verify filtered results
  const rows = await page.locator('tbody tr').count();
  expect(rows).toBeGreaterThan(0);

  // Navigate to dashboard
  await page.goto('/');

  // Verify charts render
  await expect(page.locator('canvas, svg').first()).toBeVisible();

  // Verify KPIs display
  await expect(page.locator('text=Total Expense')).toBeVisible();
});
```

## Acceptance Criteria

1. **Given** transaction edited
   **When** saving
   **Then** changes reflected in list

2. **Given** filter applied
   **When** checking URL
   **Then** filter params present

3. **Given** filtered view
   **When** navigating to dashboard
   **Then** charts render

## Definition of Done

- [ ] E2E test created
- [ ] Edit flow tested
- [ ] Filter flow tested
- [ ] Charts render tested
- [ ] Test passes consistently

## Dependencies

**Upstream:** TASK-TEST-004, TXN-010, FILT-003, DASH-006  
**Effort:** 5 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA Engineer)
