# TASK-TEST-007 - Write E2E Test: Category Management Flow

## Context & Goal

**Business Value:** Validate category CRUD and reassignment workflows (Section 16)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (E2E tests)

## Scope Definition

**✅ In Scope:**

- Create custom category
- Edit category
- Delete category with reassignment
- Verify system categories protected

**⛔ Out of Scope:**

- All edge cases (integration tests)

## Technical Specifications

```typescript
// /tests/e2e/categories.spec.ts
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test('user can manage categories', async ({ page }) => {
  await login(page, 'test@example.com', 'password');

  // Navigate to categories
  await page.goto('/categories');

  // Create custom category
  await page.click('button:has-text("Add Category")');
  await page.fill('input[name="name"]', 'Coffee');
  await page.click('button:has-text("Expense")');
  await page.click('button:has-text("Create")');

  // Verify created
  await expect(page.locator('text=Coffee')).toBeVisible();

  // Edit category
  await page.click('text=Coffee >> .. >> button:has-text("Edit")');
  await page.fill('input[name="name"]', 'Coffee & Tea');
  await page.click('button:has-text("Save")');

  // Verify edited
  await expect(page.locator('text=Coffee & Tea')).toBeVisible();

  // Try to delete system category
  await page.click('text=Groceries >> .. >> button:has-text("Delete")');
  await expect(
    page.locator('text=System categories cannot be deleted')
  ).toBeVisible();

  // Delete custom category (no transactions)
  await page.click('text=Coffee & Tea >> .. >> button:has-text("Delete")');
  await page.click('button:has-text("Confirm")');

  // Verify deleted
  await expect(page.locator('text=Coffee & Tea')).not.toBeVisible();
});
```

## Acceptance Criteria

1. **Given** category created
   **When** checking list
   **Then** category appears

2. **Given** system category delete attempted
   **When** clicking delete
   **Then** error message shown

3. **Given** custom category deleted
   **When** checking list
   **Then** category removed

## Definition of Done

- [ ] E2E test created
- [ ] Create category tested
- [ ] Edit category tested
- [ ] Delete category tested
- [ ] System category protection tested
- [ ] Test passes

## Dependencies

**Upstream:** TASK-TEST-004, CAT-007, CAT-008  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA Engineer)
