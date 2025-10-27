# TASK-TEST-012 - Conduct Load Testing (10k users, 100 concurrent)

## Context & Goal

**Business Value:** Validate scalability and reliability targets (NF-006, NF-009)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** NF-006 (10k users), NF-009 (5x traffic spikes)

## Scope Definition

**✅ In Scope:**

- Load testing tool setup (k6 or Artillery)
- Baseline load test (normal traffic)
- Spike test (5x traffic)
- 100 concurrent users simulation
- Database performance under load

**⛔ Out of Scope:**

- Chaos engineering (V2)
- Multi-region testing (V2)

## Technical Specifications

```bash
npm install -D k6
```

```javascript
// tests/load/baseline.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests < 300ms
    http_req_failed: ['rate<0.01'], // <1% errors
  },
};

export default function () {
  const authToken = login();

  // Test transaction list
  const transactionsRes = http.get('http://localhost:3000/api/transactions', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  check(transactionsRes, {
    'status is 200': r => r.status === 200,
    'response time < 300ms': r => r.timings.duration < 300,
  });

  sleep(1);

  // Test dashboard summary
  const summaryRes = http.get('http://localhost:3000/api/reports/summary', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  check(summaryRes, {
    'status is 200': r => r.status === 200,
    'response time < 300ms': r => r.timings.duration < 300,
  });

  sleep(1);
}

function login() {
  // Login and return session token
  const res = http.post('http://localhost:3000/api/auth/signin', {
    email: 'test@example.com',
    password: 'password',
  });

  return res.json('token');
}
```

```javascript
// tests/load/spike.js
export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Normal load
    { duration: '30s', target: 100 }, // Spike to 5x
    { duration: '1m', target: 100 }, // Sustained spike
    { duration: '1m', target: 20 }, // Back to normal
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Relaxed during spike
    http_req_failed: ['rate<0.05'], // <5% errors during spike
  },
};
```

## Acceptance Criteria

1. **Given** baseline load test (20 concurrent users)
   **When** running
   **Then** P95 latency <300ms, <1% errors

2. **Given** spike test (100 concurrent users)
   **When** running
   **Then** P95 latency <1s, <5% errors (per NF-009)

3. **Given** database queries under load
   **When** monitoring
   **Then** indexes used, no performance degradation

4. **Given** 10k user data
   **When** querying
   **Then** response times within targets

## Definition of Done

- [ ] Load testing tool installed (k6 or Artillery)
- [ ] Baseline load test script
- [ ] Spike test script
- [ ] Test scenarios for key endpoints
- [ ] Database populated with 10k users data
- [ ] Load tests pass per NF-006, NF-009
- [ ] Performance report generated

## Dependencies

**Upstream:** All features complete, TASK-FOUND-003 (Database)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA/DevOps Engineer)
