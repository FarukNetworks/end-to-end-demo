# TASK-TEST-008 - Setup Axe DevTools for Accessibility Testing

## Context & Goal

**Business Value:** Ensure WCAG 2.1 AA compliance (NF-021)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** NF-021 (WCAG 2.1 AA), Section 16 (Accessibility checks)

## Scope Definition

**✅ In Scope:**

- axe-core integration
- Playwright accessibility testing
- Automated accessibility scans
- CI integration
- Violation reporting

**⛔ Out of Scope:**

- Manual accessibility testing (separate)
- Screen reader testing (manual process)

## Technical Specifications

```bash
npm install -D @axe-core/playwright axe-core
```

```typescript
// /tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from './helpers/auth';

test.describe('accessibility', () => {
  test('dashboard should have no critical accessibility violations', async ({
    page,
  }) => {
    await login(page, 'test@example.com', 'password');
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('transactions page should have no critical violations', async ({
    page,
  }) => {
    await login(page, 'test@example.com', 'password');
    await page.goto('/transactions');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('forms should be accessible', async ({ page }) => {
    await login(page, 'test@example.com', 'password');

    await page.click('button:has-text("Add Transaction")');
    await page.waitForSelector('form');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## Acceptance Criteria

1. **Given** key pages scanned
   **When** running axe
   **Then** zero critical violations

2. **Given** forms scanned
   **When** checking ARIA
   **Then** proper labels and descriptions present

3. **Given** CI environment
   **When** accessibility tests run
   **Then** failures block merge

## Definition of Done

- [ ] axe-core installed
- [ ] Accessibility tests for key pages
- [ ] WCAG 2.1 AA tags configured
- [ ] CI integration
- [ ] Zero critical violations on key pages

## Dependencies

**Upstream:** TASK-TEST-004 (Playwright)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA Engineer)
