# TASK-TEST-010 - Setup Lighthouse CI for Performance Testing

## Context & Goal

**Business Value:** Validate performance requirements (NF-001 to NF-005)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** NF-001 (Dashboard TTI <2s), NF-002 to NF-005

## Scope Definition

**✅ In Scope:**

- Lighthouse CI installation
- Performance budgets configuration
- CI integration
- Key pages performance testing
- Report generation

**⛔ Out of Scope:**

- Real User Monitoring (RUM) - Production
- CDN optimization - Deployment

## Technical Specifications

```bash
npm install -D @lhci/cli
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/transactions',
        'http://localhost:3000/categories',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        interactive: ['error', { maxNumericValue: 2000 }], // TTI <2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

```json
// package.json
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:ci": "lhci autorun --collect.numberOfRuns=1"
  }
}
```

## Acceptance Criteria

1. **Given** Lighthouse CI configured
   **When** running `npm run lighthouse`
   **Then** performance reports generated

2. **Given** dashboard page
   **When** checking TTI
   **Then** <2000ms (per NF-001)

3. **Given** performance budgets
   **When** metrics exceed limits
   **Then** CI build fails

## Definition of Done

- [ ] Lighthouse CI installed
- [ ] lighthouserc.js configured
- [ ] Performance budgets set per PRD
- [ ] Key pages included
- [ ] CI integration configured
- [ ] Reports accessible

## Dependencies

**Upstream:** TASK-FOUND-001, All UI pages  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend/QA Engineer)
