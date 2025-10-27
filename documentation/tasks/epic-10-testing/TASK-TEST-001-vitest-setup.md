# TASK-TEST-001 - Setup Vitest for Unit Testing

## Context & Goal

**Business Value:** Enable fast unit testing for utilities and validators (Section 16)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (Testing Strategy), Unit tests for validators

## Scope Definition

**✅ In Scope:**

- Vitest installation and configuration
- Test utilities setup
- Coverage reporting
- CI integration
- Test script in package.json

**⛔ Out of Scope:**

- E2E testing (TASK-TEST-004)
- Component testing (covered by integration tests)

## Technical Specifications

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=junit"
  }
}
```

## Acceptance Criteria

1. **Given** Vitest configured
   **When** running `npm test`
   **Then** test runner starts

2. **Given** test file created
   **When** running tests
   **Then** tests execute and results shown

3. **Given** coverage enabled
   **When** running `npm run test:coverage`
   **Then** coverage report generated

4. **Given** CI environment
   **When** running tests
   **Then** JUnit report generated for CI integration

## Definition of Done

- [ ] Vitest installed
- [ ] vitest.config.ts configured
- [ ] Test setup file created
- [ ] Coverage reporting configured
- [ ] Test scripts in package.json
- [ ] Example test runs successfully

## Dependencies

**Upstream:** TASK-FOUND-001 (Project setup)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA/Backend Engineer)
