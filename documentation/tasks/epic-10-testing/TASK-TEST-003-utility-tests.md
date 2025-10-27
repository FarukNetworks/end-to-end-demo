# TASK-TEST-003 - Write Unit Tests for Utility Functions

## Context & Goal

**Business Value:** Ensure utility functions work correctly (Section 16)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** Section 16 (Unit tests)

## Scope Definition

**✅ In Scope:**

- Tests for chart utilities (formatCurrency, formatNumber)
- Tests for form utilities
- Tests for date utilities
- Tests for logger
- > 90% coverage for utils

**⛔ Out of Scope:**

- React component testing (integration tests)

## Technical Specifications

```typescript
// /tests/unit/utils/chart-utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber } from '@/lib/chart-utils';

describe('formatCurrency', () => {
  it('should format EUR with German locale', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('1.234,56 €');
  });

  it('should handle zero', () => {
    const result = formatCurrency(0);
    expect(result).toBe('0,00 €');
  });

  it('should handle negative values', () => {
    const result = formatCurrency(-100);
    expect(result).toBe('-100,00 €');
  });
});

// /tests/unit/utils/logger.test.ts
describe('logger', () => {
  it('should format log as JSON', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    logger.info('Test message', { userId: '123' });

    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logOutput.level).toBe('info');
    expect(logOutput.message).toBe('Test message');
    expect(logOutput.userId).toBe('123');
  });

  it('should not log email addresses', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    logger.apiRequest({
      method: 'GET',
      route: '/api/test',
      userId: 'user-id',
      statusCode: 200,
      duration: 100,
    });

    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).not.toContain('@');
  });
});
```

## Acceptance Criteria

1. **Given** all utility functions
   **When** running tests
   **Then** >90% coverage achieved

2. **Given** formatCurrency(1234.56)
   **When** testing
   **Then** returns "1.234,56 €" (German locale)

3. **Given** logger tests
   **When** checking PII filtering
   **Then** no email addresses in logs

## Definition of Done

- [ ] Tests for chart-utils
- [ ] Tests for logger
- [ ] Tests for form-utils
- [ ] Tests for any custom utilities
- [ ] > 90% coverage
- [ ] All edge cases covered

## Dependencies

**Upstream:** TASK-TEST-001 (Vitest)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA/Backend Engineer)
