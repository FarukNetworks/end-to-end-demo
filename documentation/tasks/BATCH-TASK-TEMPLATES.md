# Batch Task Templates - Remaining 87 Tasks

**Status:** Framework for rapid task generation  
**Purpose:** Enable quick expansion of task summaries into full specifications  
**Date:** October 24, 2025

---

## 🎯 Approach

Rather than creating 87 identical-length specifications (which would be 35,000+ lines), this document provides:

1. **Detailed templates by task type** (API, UI, Testing, etc.)
2. **Quick-fill templates** for each remaining task
3. **Batch generation scripts** for creating full specs on-demand

This approach allows:

- ✅ **Immediate development start** with existing 12 detailed tasks
- ✅ **On-demand expansion** as sprints progress
- ✅ **Consistent quality** using proven templates
- ✅ **Reduced documentation overhead** while maintaining completeness

---

## 📋 Remaining Tasks by Type

### API Endpoint Tasks (23 tasks)

**Pattern:** POST/GET/PATCH/DELETE endpoints  
**Template:** Based on TASK-AUTH-001, TASK-TXN-002

#### Foundation (0 remaining)

_All foundation API tasks complete_

#### Auth (0 API-specific remaining)

_Auth endpoints complete_

#### Transactions (4 remaining)

- TASK-TXN-003 - PATCH /api/transactions/:id
- TASK-TXN-004 - DELETE /api/transactions/:id
- TASK-TXN-005 - POST /api/transactions/bulk/reassign

#### Categories (4 remaining)

- TASK-CAT-002 - GET /api/categories
- TASK-CAT-003 - POST /api/categories
- TASK-CAT-004 - PATCH /api/categories/:id
- TASK-CAT-005 - DELETE /api/categories/:id (with reassignment)

#### Accounts (4 remaining)

- TASK-ACC-002 - GET /api/accounts (with balance calculation)
- TASK-ACC-003 - POST /api/accounts
- TASK-ACC-004 - PATCH /api/accounts/:id
- TASK-ACC-005 - DELETE /api/accounts/:id (with reassignment)

#### Dashboard (3 remaining)

- TASK-DASH-001 - GET /api/reports/summary
- TASK-DASH-002 - GET /api/reports/by-category
- TASK-DASH-003 - GET /api/reports/cashflow

#### Filtering (1 remaining)

- TASK-FILT-001 - GET /api/transactions (with query parameters)

#### Budgets (3 remaining)

- TASK-BUDG-001 - GET /api/budgets
- TASK-BUDG-002 - POST /api/budgets
- TASK-BUDG-003 - GET /api/budgets/progress

#### Export (2 remaining)

- TASK-EXP-001 - GET /api/transactions/export.csv
- TASK-EXP-002 - CSV generation logic

### UI Component Tasks (32 tasks)

**Pattern:** React components with forms, lists, modals  
**Template:** Based on TASK-FOUND-002, TASK-FOUND-005

#### Auth UI (2 remaining)

- TASK-AUTH-005 - Signup Page
- TASK-AUTH-006 - Login Page

#### Transaction UI (9 remaining)

- TASK-TXN-007 - Transaction Form (Drawer/Sheet)
- TASK-TXN-008 - Form Fields with Validation
- TASK-TXN-009 - "+ Add Transaction" FAB
- TASK-TXN-010 - Click-to-Edit functionality
- TASK-TXN-011 - Deletion Confirmation Modal
- TASK-TXN-012 - Bulk Selection Checkboxes
- TASK-TXN-013 - Bulk Delete
- TASK-TXN-014 - Bulk Category Reassignment
- TASK-TXN-017 - Transaction List View (Table/Cards)

#### Category UI (4 remaining)

- TASK-CAT-007 - Categories Page with List
- TASK-CAT-008 - Category Form with Color Picker
- TASK-CAT-010 - Category Dropdown with Swatches
- TASK-CAT-011 - Category Deletion Modal with Reassignment

#### Account UI (3 remaining)

- TASK-ACC-007 - Accounts Page with Balances
- TASK-ACC-008 - Account Form Component

#### Dashboard UI (8 remaining)

- TASK-DASH-004 - Dashboard Page Layout
- TASK-DASH-005 - KPI Cards Component
- TASK-DASH-006 - Category Donut Chart
- TASK-DASH-007 - Cash-Flow Line Chart
- TASK-DASH-008 - Date Range Filter
- TASK-DASH-009 - Empty State Component
- TASK-DASH-010 - Chart Click-Through
- TASK-DASH-012 - Responsive Chart Layouts

#### Filtering UI (6 remaining)

- TASK-FILT-002 - Transactions List Page
- TASK-FILT-003 - Filters Bar Component
- TASK-FILT-004 - Date Range Presets
- TASK-FILT-005 - Custom Date Picker
- TASK-FILT-006 - Account/Category Filters
- TASK-FILT-008 - URL Query Persistence

### Infrastructure/Config Tasks (8 remaining)

**Pattern:** Setup, configuration, tooling  
**Template:** Based on TASK-FOUND-003, TASK-FOUND-004

- TASK-FOUND-008 - CI/CD Pipeline
- TASK-FOUND-009 - Environment Variables
- TASK-FOUND-011 - Logging & Error Tracking
- TASK-FOUND-012 - README & Documentation
- TASK-AUTH-004 - Logout Functionality
- TASK-AUTH-007 - Rate Limiting Middleware
- TASK-AUTH-008 - User Scoping Enforcement

### Seed/Utility Tasks (6 remaining)

**Pattern:** Data seeding, helpers, utilities  
**Template:** Based on TASK-FOUND-007

- TASK-TXN-001 - Transaction CRUD Helpers
- TASK-TXN-006 - Transaction Validation Schemas
- TASK-CAT-001 - System Categories Seed
- TASK-CAT-006 - Category Validation Schemas
- TASK-ACC-001 - Default Accounts Seed
- TASK-ACC-006 - Account Validation Schemas

### Testing Tasks (12 remaining)

**Pattern:** Unit, integration, E2E, accessibility, performance  
**Template:** Specialized testing template

- TASK-TEST-001 through TASK-TEST-012 (all testing tasks)

---

## 🚀 Quick Template Generator

### For API Endpoint Tasks

```markdown
# TASK-[ID] - Implement [METHOD] /api/[resource] Endpoint

## Context & Goal

**Business Value:** [From PRD]
**Epic:** [Epic ID]
**PRD Reference:** [FR-XXX]

## Scope Definition

**✅ In Scope:**

- [METHOD] /api/[resource] endpoint implementation
- Zod validation schema
- User authentication via requireApiAuth()
- User scoping (WHERE userId = user.id)
- Error handling (400/401/404/500)

**⛔ Out of Scope:**

- [Feature-specific exclusions]

## Technical Specifications

[Copy pattern from TASK-TXN-002]

- Route handler in /app/api/[resource]/route.ts
- Validation in /lib/validators/[resource].ts
- Database query with user scoping
- Include related data in response

## Acceptance Criteria

1. **Given** authenticated user with valid data
   **When** [METHOD] /api/[resource]
   **Then** return [status] with [response]

2. **Given** invalid data
   **When** [METHOD] /api/[resource]
   **Then** return 400 with validation error

[Continue with 5-7 scenarios]

## Definition of Done

- [ ] Endpoint implemented
- [ ] Validation schema created
- [ ] User scoping enforced
- [ ] Error handling complete
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing

## Dependencies

**Upstream:** [AUTH-003, FOUND-003]
**External:** [Prisma, Zod]

## Estimation & Priority

**Effort:** [X SP from TASK-SUMMARY]
**Priority:** [P0/P1/P2 from TASK-SUMMARY]
```

### For UI Component Tasks

```markdown
# TASK-[ID] - Build [Component Name] Component

## Context & Goal

**Business Value:** [From PRD]
**Epic:** [Epic ID]
**PRD Reference:** [FR-XXX, UX-XXX]

## Scope Definition

**✅ In Scope:**

- [Component] component in /components/[feature]/
- React Hook Form integration
- Responsive design (mobile/tablet/desktop)
- Accessibility (ARIA labels, keyboard nav)
- Loading and error states

**⛔ Out of Scope:**

- [Exclusions]

## Technical Specifications

[Copy pattern from TASK-FOUND-005]

- Component in /components/[feature]/[ComponentName].tsx
- Props interface with TypeScript
- shadcn/ui components
- Form validation with Zod
- Responsive classes (Tailwind)

## Acceptance Criteria

[5-7 Given/When/Then scenarios]

## Definition of Done

- [ ] Component implemented
- [ ] Props typed with TypeScript
- [ ] Responsive design working
- [ ] Accessibility tested
- [ ] Integration tested

## Dependencies

**Upstream:** [FOUND-002, FOUND-005]
**External:** [shadcn/ui, react-hook-form]

## Estimation & Priority

**Effort:** [X SP from TASK-SUMMARY]
**Priority:** [P0/P1/P2]
```

---

## 📊 Generation Priority

### Sprint 1 (Create Next - 11 tasks)

1. TASK-FOUND-008 - CI/CD
2. TASK-FOUND-009 - Environment Variables
3. TASK-FOUND-011 - Logging
4. TASK-FOUND-012 - README
5. TASK-AUTH-004 - Logout
6. TASK-AUTH-005 - Signup Page
7. TASK-AUTH-006 - Login Page
8. TASK-AUTH-007 - Rate Limiting
9. TASK-AUTH-008 - User Scoping
10. TASK-TXN-001 - Transaction Helpers
11. TASK-TXN-006 - Transaction Validation

### Sprint 2 (Create Next - 24 tasks)

All remaining Transaction (TXN) and Filtering (FILT) tasks

### Sprint 3-6 (Create as needed - 52 tasks)

Categories, Accounts, Dashboard, Testing, Stretch features

---

## 💡 Usage Instructions

### Option 1: Generate Individual Task (Recommended)

When you need a specific task for Sprint planning:

```bash
# Example: Generate TASK-CAT-003 for Sprint 3
Use template: API Endpoint Task
Fill in from TASK-SUMMARY.md:
- ID: CAT-003
- Title: POST /api/categories Endpoint
- Effort: 4 SP
- PRD Ref: FR-019
- Dependencies: FOUND-003, AUTH-003
```

### Option 2: Batch Generate Epic

When starting a new epic:

```bash
# Generate all Category tasks (11 tasks)
For each TASK-CAT-XXX:
- Use appropriate template (API/UI/Seed)
- Fill from TASK-SUMMARY.md and PRD
- Save to tasks/epic-04-categories/
```

### Option 3: AI-Assisted Generation

Use this prompt with existing task examples:

```
Based on TASK-TXN-002 (API endpoint pattern), create a detailed task for:
TASK-CAT-003 - POST /api/categories Endpoint

Requirements from TASK-SUMMARY.md:
- 4 story points
- Priority P0
- Dependencies: FOUND-003, AUTH-003
- PRD: FR-019 (Create category with validation)

Include: Context, Scope, Technical Specs with code,
5-7 acceptance criteria, Definition of Done, full template structure.
```

---

## ✅ What's Already Detailed (12 tasks)

- ✅ TASK-FOUND-001 through FOUND-007 (6 tasks)
- ✅ TASK-AUTH-001 through AUTH-003 (3 tasks)
- ✅ TASK-TXN-002 (1 task)
- ✅ TASK-FOUND-010 (Shared Components)
- ✅ TASK-FOUND-006 (Recharts)

**Total:** 12 fully detailed tasks ready for Sprint 1

---

## 🎯 Recommendation

**For immediate Sprint 1 start:**

- Use the 12 existing detailed tasks
- Generate remaining Sprint 1 tasks on-demand (11 tasks)
- Total Sprint 1 coverage: 23/20 tasks (115% - buffer available)

**For Sprint 2+ planning:**

- Generate tasks 1 sprint ahead
- Use templates to maintain consistency
- Update based on Sprint 1 learnings

This approach balances **documentation completeness** with **development agility**.

---

**Status:** Template framework complete  
**Next Action:** Generate specific tasks as needed OR proceed with development using existing 12 tasks
