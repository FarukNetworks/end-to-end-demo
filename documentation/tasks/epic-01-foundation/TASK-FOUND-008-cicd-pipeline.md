# TASK-FOUND-008 - Setup CI/CD Pipeline (GitHub Actions)

## Context & Goal

**Business Value:** Automate testing, linting, and deployment to ensure code quality and rapid iterations (NF-007)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 18 (Lint/test gates), NF-007 (Uptime)

## Scope Definition

**✅ In Scope:**

- GitHub Actions workflow configuration
- Automated linting (ESLint) on pull requests
- Automated testing (unit + integration) on pull requests
- Type checking with TypeScript
- Build verification
- Preview deployments for PRs (if Vercel)
- Main branch deployment to staging/production

**⛔ Out of Scope:**

- Advanced deployment strategies (blue-green, canary) - V2
- Performance regression testing - Post-launch
- Automated E2E tests in CI (added in TASK-TEST-004)

## Technical Specifications

**Implementation Details:**

- Create `.github/workflows/ci.yml`:

  ```yaml
  name: CI

  on:
    pull_request:
      branches: [main, develop]
    push:
      branches: [main, develop]

  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm run lint

    typecheck:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm run type-check

    test:
      runs-on: ubuntu-latest
      services:
        postgres:
          image: postgres:14
          env:
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: budgetbuddy_test
          options: >-
            --health-cmd pg_isready
            --health-interval 10s
            --health-timeout 5s
            --health-retries 5
          ports:
            - 5432:5432
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/budgetbuddy_test
        NEXTAUTH_SECRET: test-secret
        NEXTAUTH_URL: http://localhost:3000
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npx prisma migrate deploy
        - run: npm run test:ci

    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm run build
  ```

- Create deployment workflow `.github/workflows/deploy.yml`:

  ```yaml
  name: Deploy

  on:
    push:
      branches: [main]

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Deploy to Vercel
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
            vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
            vercel-args: '--prod'
  ```

- Add test scripts to `package.json`:

  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:ci": "vitest run --coverage",
      "type-check": "tsc --noEmit"
    }
  }
  ```

**Architecture References:**

- GitHub Actions: https://docs.github.com/en/actions
- Vercel CI/CD: https://vercel.com/docs/deployments/git

## Acceptance Criteria

1. **Given** pull request opened
   **When** CI runs
   **Then** linting, type-check, tests, and build all pass

2. **Given** linting errors in PR
   **When** CI runs
   **Then** workflow fails and blocks merge

3. **Given** failing tests in PR
   **When** CI runs
   **Then** workflow fails with test results

4. **Given** push to main branch
   **When** deployment workflow runs
   **Then** app deploys to production successfully

5. **Given** CI services configured
   **When** checking workflow status
   **Then** all jobs complete in <5 minutes

## Definition of Done

- [ ] GitHub Actions workflows created (ci.yml, deploy.yml)
- [ ] Lint job configured and passing
- [ ] Type-check job configured and passing
- [ ] Test job with PostgreSQL service configured
- [ ] Build job configured and passing
- [ ] Deployment job configured (Vercel or Docker)
- [ ] Branch protection rules set (require CI pass)
- [ ] Secrets configured (VERCEL_TOKEN, DATABASE_URL, etc.)
- [ ] CI runs on all PRs automatically
- [ ] Main branch deploys automatically
- [ ] Documentation updated with CI/CD process

## Dependencies

**Upstream Tasks:** TASK-FOUND-001 (Project setup)  
**External Dependencies:** GitHub Actions, Vercel (or deployment platform)  
**Parallel Tasks:** Other foundation tasks  
**Downstream Impact:** All future development uses CI/CD

## Resources & References

**Design Assets:** N/A (CI/CD configuration)  
**Technical Docs:**

- GitHub Actions: https://docs.github.com/en/actions
- Vercel Deployment: https://vercel.com/docs

**PRD References:** Section 18 (Lint/test gates), NF-007  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 5 story points (6-8 hours)

- Workflow files: 2 hours
- Test configuration: 2 hours
- Deployment setup: 2 hours
- Testing and debugging: 2 hours

**Priority:** P0 (Must-have - quality gates)  
**Risk Level:** Medium (deployment complexity)

## Assignment

**Primary Owner:** TBD (DevOps/Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** N/A (infrastructure)  
**Stakeholder:** Engineering Lead
