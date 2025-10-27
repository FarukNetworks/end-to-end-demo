# TASK-TEST-004 - Setup Playwright for E2E Testing

## Context & Goal

**Business Value:** Enable automated end-to-end testing of user flows (Section 16)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (E2E tests with Playwright)

## Scope Definition

**✅ In Scope:**

- Playwright installation and configuration
- Test database setup
- Authentication helpers
- Screenshot/video on failure
- CI integration
- Example E2E test

**⛔ Out of Scope:**

- Visual regression testing (V2)
- Cross-browser testing in CI (local only initially)

## Technical Specifications

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// tests/e2e/helpers/auth.ts
import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function signup(page: Page, email: string, password: string) {
  await page.goto('/signup');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/login');
}
```

## Acceptance Criteria

1. **Given** Playwright installed
   **When** running `npx playwright test`
   **Then** tests execute

2. **Given** test failure
   **When** checking artifacts
   **Then** screenshot and trace available

3. **Given** CI environment
   **When** tests run
   **Then** reports generated

## Definition of Done

- [ ] Playwright installed and configured
- [ ] playwright.config.ts created
- [ ] Test helpers (auth, etc.) created
- [ ] Screenshot/video on failure
- [ ] CI configuration updated
- [ ] Example test runs successfully

## Dependencies

**Upstream:** TASK-FOUND-001 (Project)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA Engineer)
