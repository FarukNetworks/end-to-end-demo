# BudgetBuddy - Epic Definitions

**Project:** BudgetBuddy Personal Finance Tracker  
**Version:** 1.0  
**Date:** October 24, 2025

---

## Epic Overview

This document defines the high-level epics that organize all development work for BudgetBuddy V1. Each epic groups related user stories and development tasks to ensure complete requirement coverage and efficient development execution.

---

## Epic Breakdown Summary

| Epic ID     | Epic Name                        | User Stories | Dev Tasks | Effort (SP) | Priority | Milestone    |
| ----------- | -------------------------------- | ------------ | --------- | ----------- | -------- | ------------ |
| **EPIC-01** | Foundation & Infrastructure      | -            | 12        | 40          | P0       | M1           |
| **EPIC-02** | Authentication & User Management | 2            | 8         | 35          | P0       | M1           |
| **EPIC-03** | Transaction Management           | 3            | 15        | 65          | P0       | M2           |
| **EPIC-04** | Category Management              | 3            | 10        | 40          | P0       | M3           |
| **EPIC-05** | Account Management               | 2            | 8         | 30          | P0       | M3           |
| **EPIC-06** | Dashboard & Reporting            | 3            | 12        | 50          | P0       | M4           |
| **EPIC-07** | Transaction List & Filtering     | -            | 8         | 30          | P0       | M2           |
| **EPIC-08** | Budgets (Stretch)                | 1            | 6         | 25          | P2       | V1.1         |
| **EPIC-09** | Data Export (Stretch)            | -            | 4         | 15          | P2       | V1.1         |
| **EPIC-10** | Testing & Quality Assurance      | -            | 10        | 40          | P0       | M5           |
| **TOTAL**   |                                  | **14**       | **93**    | **370 SP**  |          | **12 weeks** |

---

## EPIC-01: Foundation & Infrastructure

### Epic Overview

**Business Objective:** Establish technical foundation and development infrastructure to enable all feature development  
**PRD References:** Section 7 (Technical Stack), Section 9 (Project Structure), NF-001 to NF-030  
**Milestone:** M1 (Weeks 1-2)

### Success Metrics

- Next.js app running locally and in staging
- Database schema deployed and migrated
- CI/CD pipeline operational with automated tests
- Development environment setup time <30 minutes

### Scope

**✅ In Scope:**

- Next.js 14+ project setup with App Router
- PostgreSQL database setup and Prisma configuration
- Tailwind CSS + shadcn/ui component library integration
- NextAuth.js authentication configuration
- Development, staging, and production environment setup
- CI/CD pipeline configuration
- Database migration scripts and seed data
- Project documentation (README, setup guides)

**⛔ Out of Scope:**

- Feature implementation (covered in other epics)
- Production deployment (M5)
- Advanced monitoring setup (V1.1)

### Key Deliverables

1. Next.js project with TypeScript, Tailwind, shadcn/ui
2. Prisma schema with all models (User, Account, Category, Transaction, Budget)
3. Database migration scripts and seed data
4. NextAuth configuration with credentials provider
5. CI/CD pipeline (GitHub Actions or similar)
6. Development environment documentation
7. Deployment configuration (Vercel or Docker)

### Dependencies

- PostgreSQL managed service or Docker setup
- Hosting platform decision (Vercel vs. VPS)
- Domain and SSL certificate setup

---

## EPIC-02: Authentication & User Management

### Epic Overview

**Business Objective:** Enable secure user registration, authentication, and session management  
**PRD References:** FR-001 to FR-006, NF-010 to NF-014, US-001  
**Milestone:** M1 (Weeks 1-2)

### Success Metrics

- User registration completion rate >85%
- Login success rate >99%
- Password security: bcrypt with 10+ rounds
- Rate limiting: 5 failed login attempts per 15 min

### User Stories

- **US-AUTH-01:** As a new user, I want to register with email/password so I can create my account
- **US-AUTH-02:** As a registered user, I want to log in securely so I can access my data

### Scope

**✅ In Scope:**

- User signup with email/password validation
- User login with NextAuth credentials provider
- Password hashing with bcrypt (10+ rounds)
- Session management with secure cookies
- Logout functionality
- Protected route middleware
- Rate limiting on auth endpoints
- CSRF protection
- User scoping enforcement on all queries

**⛔ Out of Scope:**

- Password reset (V1.1)
- Email verification (V1.1)
- Social login (V2)
- Multi-factor authentication (V2)

### Key Deliverables

1. `/api/auth/signup` route handler
2. `/api/auth/signin` route handler (NextAuth)
3. `/api/auth/signout` route handler
4. Protected route middleware
5. Rate limiting middleware
6. User model with password hashing
7. Default categories and accounts seed on signup
8. Login/signup pages with forms

### Dependencies

- EPIC-01 (Foundation & Infrastructure)
- Email service configuration (for future email verification)

---

## EPIC-03: Transaction Management

### Epic Overview

**Business Objective:** Enable users to quickly log, edit, and delete transactions with <10s capture time  
**PRD References:** FR-007 to FR-015, UX-002, UX-003, UX-004, US-001, US-002, US-003  
**Milestone:** M2 (Weeks 3-5)

### Success Metrics

- Transaction logging time <10 seconds (P95)
- Transaction creation API <500ms (P95)
- Form validation errors displayed within 100ms
- 90% of users successfully log first transaction within 5 minutes

### User Stories

- **US-TXN-01:** As a user, I want to log an expense in under 10 seconds (US-001 from PRD)
- **US-TXN-02:** As a user, I want to edit transactions I logged incorrectly (US-002 from PRD)
- **US-TXN-03:** As a user, I want to delete multiple transactions at once (US-003 from PRD)

### Scope

**✅ In Scope:**

- Transaction form (drawer on desktop, full-screen on mobile)
- Create transaction API endpoint
- Edit transaction functionality
- Delete transaction with confirmation
- Bulk delete transactions
- Bulk category reassignment
- Form validation (Zod schemas)
- Real-time dashboard updates
- Success/error toast notifications
- Transaction list view with actions

**⛔ Out of Scope:**

- Recurring transactions (Stretch)
- Transaction attachments (V1.1)
- Transaction import (V1.1)
- AI-powered categorization (V2)

### Key Deliverables

1. `POST /api/transactions` endpoint
2. `PATCH /api/transactions/:id` endpoint
3. `DELETE /api/transactions/:id` endpoint
4. `POST /api/transactions/bulk/reassign` endpoint
5. Transaction form component (React Hook Form + Zod)
6. Transaction row click-to-edit functionality
7. Bulk action controls (multi-select checkboxes)
8. Validation schemas for transaction data
9. Toast notification system
10. Loading states and optimistic UI updates

### Dependencies

- EPIC-01 (Database schema)
- EPIC-02 (Authentication)
- EPIC-04 (Categories must exist)
- EPIC-05 (Accounts must exist)

---

## EPIC-04: Category Management

### Epic Overview

**Business Objective:** Enable users to organize spending with custom categories and color-coding  
**PRD References:** FR-016 to FR-025, US-004, US-005, US-006  
**Milestone:** M3 (Weeks 6-7)

### Success Metrics

- 40% of users create at least 1 custom category
- Category creation time <30 seconds
- Zero category deletions without proper transaction reassignment
- System categories never deleted

### User Stories

- **US-CAT-01:** As a user, I want to create custom categories with colors (US-004 from PRD)
- **US-CAT-02:** As a user, I want to reassign multiple transactions to a different category (US-005 from PRD)
- **US-CAT-03:** As a user, I want system default categories pre-populated (US-006 from PRD)

### Scope

**✅ In Scope:**

- System default categories created on signup (10 categories)
- Categories page with list view (grouped by type)
- Create custom category with color picker
- Edit custom category (name, color)
- Delete custom category with reassignment flow
- Prevent system category deletion
- Category color swatches in dropdowns
- Category validation (unique names, case-insensitive)

**⛔ Out of Scope:**

- Category icons (V1.1)
- Category budgets (Stretch EPIC-08)
- Category analytics (included in EPIC-06)
- Category templates or import (V2)

### Key Deliverables

1. System categories seed script
2. `GET /api/categories` endpoint
3. `POST /api/categories` endpoint
4. `PATCH /api/categories/:id` endpoint
5. `DELETE /api/categories/:id` endpoint with reassignment
6. Categories page UI
7. Category form component with color picker
8. Category deletion confirmation modal
9. Category dropdown component with color swatches
10. Category validation schemas

### Dependencies

- EPIC-01 (Database schema)
- EPIC-02 (Authentication)

---

## EPIC-05: Account Management

### Epic Overview

**Business Objective:** Enable users to track transactions across multiple accounts (wallets)  
**PRD References:** FR-026 to FR-034, US-010, US-011  
**Milestone:** M3 (Weeks 6-7)

### Success Metrics

- Default accounts ("Cash", "Card") created for 100% of users
- Account balance calculations accurate within €0.01
- 30% of users create additional custom accounts
- Account deletion with reassignment 100% successful

### User Stories

- **US-ACC-01:** As a user, I want to track transactions across multiple accounts (US-010 from PRD)
- **US-ACC-02:** As a user, I want to see derived account balances (US-011 from PRD)

### Scope

**✅ In Scope:**

- Default accounts ("Cash", "Card") created on signup
- Accounts page with list view
- Create custom account with color
- Edit account (name, color)
- Delete account with reassignment flow
- Derived balance calculation (sum of transactions)
- Account filter in transaction list

**⛔ Out of Scope:**

- Manual balance adjustments (V1.1)
- Account transfer transactions (V1.1)
- Account reconciliation (V2)
- Bank account linking (Never - privacy-first)

### Key Deliverables

1. Default accounts seed script
2. `GET /api/accounts` endpoint with balances
3. `POST /api/accounts` endpoint
4. `PATCH /api/accounts/:id` endpoint
5. `DELETE /api/accounts/:id` endpoint with reassignment
6. Accounts page UI
7. Account form component with color picker
8. Account deletion confirmation modal
9. Account balance calculation logic
10. Account validation schemas

### Dependencies

- EPIC-01 (Database schema)
- EPIC-02 (Authentication)

---

## EPIC-06: Dashboard & Reporting

### Epic Overview

**Business Objective:** Provide clear visibility into spending patterns and cash-flow trends  
**PRD References:** FR-040 to FR-046, UX-008, UX-009, UX-010, US-007, US-008, US-009  
**Milestone:** M4 (Weeks 8-10)

### Success Metrics

- Dashboard TTI <2 seconds (P95)
- Charts render within 1 second after data fetch
- 50% of users review dashboard at least monthly
- Chart interaction rate >30%

### User Stories

- **US-DASH-01:** As a user, I want to see my total spending this month on the dashboard (US-007 from PRD)
- **US-DASH-02:** As a user, I want to view a category breakdown chart (US-008 from PRD)
- **US-DASH-03:** As a user, I want to see monthly cash-flow over time (US-009 from PRD)

### Scope

**✅ In Scope:**

- Dashboard page with KPI cards (Total Income, Expense, Net, Count)
- Category breakdown donut chart (Recharts)
- Monthly cash-flow line chart (Recharts)
- Date range filters (This Month, Last Month, Custom)
- Chart interactivity (click segment → filter transactions)
- Empty state with CTA
- Responsive chart layouts
- Accessible chart data tables

**⛔ Out of Scope:**

- Budget progress indicators (Stretch EPIC-08)
- Advanced analytics (trend predictions, anomaly detection) - V2
- Export charts as images - V1.1
- Custom date comparisons - V1.1

### Key Deliverables

1. Dashboard page (`/` route)
2. `GET /api/reports/summary` endpoint
3. `GET /api/reports/by-category` endpoint
4. `GET /api/reports/cashflow` endpoint
5. KPI cards component
6. Donut chart component (Recharts)
7. Line chart component (Recharts)
8. Date range filter component
9. Empty state component
10. Chart accessibility (aria labels, data tables)
11. Chart responsive layouts
12. Chart click-through to transactions

### Dependencies

- EPIC-03 (Transaction data)
- EPIC-04 (Category data)
- EPIC-07 (Transaction filtering)

---

## EPIC-07: Transaction List & Filtering

### Epic Overview

**Business Objective:** Enable users to search, filter, and navigate transaction history efficiently  
**PRD References:** FR-035 to FR-039, UX-015  
**Milestone:** M2 (Weeks 3-5)

### Success Metrics

- Transaction list page load <200ms (P95)
- Filter application <300ms
- 80% of users apply at least one filter
- Search results displayed within 100ms

### Scope

**✅ In Scope:**

- Transaction list page with pagination (50 per page)
- Date range filters (presets + custom)
- Account filter
- Category filter
- Type filter (expense/income)
- Search by note field
- URL query parameter persistence
- Responsive table/card layout
- Sort by date (descending default)

**⛔ Out of Scope:**

- Advanced search (tags, amount ranges) - V1.1
- Saved filter presets - V1.1
- Export filtered results - Stretch EPIC-09

### Key Deliverables

1. `/transactions` page
2. `GET /api/transactions` endpoint with query params
3. Filters bar component
4. Date range preset buttons
5. Custom date picker
6. Account dropdown filter
7. Category dropdown filter
8. Search input with debounce
9. Pagination controls
10. Transaction table/card layout responsive component

### Dependencies

- EPIC-03 (Transaction CRUD)
- EPIC-04 (Categories)
- EPIC-05 (Accounts)

---

## EPIC-08: Budgets (Stretch - V1.1)

### Epic Overview

**Business Objective:** Enable users to set monthly spending targets per category  
**PRD References:** FR-047 to FR-050, US-012  
**Milestone:** V1.1 (Post-Launch)  
**Priority:** P2 (Could-have)

### Success Metrics

- 20% of users create at least 1 budget
- Budget status calculation accuracy 100%
- Budget alerts displayed within 1 second of threshold breach

### User Stories

- **US-BUDGET-01:** As a user, I want to set a monthly budget per category (US-012 from PRD)

### Scope

**✅ In Scope:**

- Budgets page with list view
- Create budget (category, month, target amount)
- Budget progress calculation (OK/Warn/Over)
- Budget progress bars on dashboard
- Budget validation (unique per category/month/year)

**⛔ Out of Scope:**

- Budget notifications/alerts - V2
- Recurring budgets - V2
- Budget templates - V2

### Key Deliverables

1. `GET /api/budgets` endpoint
2. `POST /api/budgets` endpoint
3. `GET /api/budgets/progress` endpoint
4. Budgets page UI
5. Budget form component
6. Budget progress bars on dashboard
7. Budget status calculation logic

### Dependencies

- EPIC-04 (Categories)
- EPIC-06 (Dashboard integration)

---

## EPIC-09: Data Export (Stretch - V1.1)

### Epic Overview

**Business Objective:** Enable users to export transaction data for external use (tax, accounting)  
**PRD References:** FR-051 to FR-052  
**Milestone:** V1.1 (Post-Launch)  
**Priority:** P2 (Could-have)

### Success Metrics

- 15% of users export data at least once
- CSV export generation <5 seconds for 10k transactions
- 100% data accuracy in exports

### Scope

**✅ In Scope:**

- CSV export of all transactions
- CSV export of filtered transactions
- Date range export
- Export button on settings page
- CSV format: Date, Type, Amount, Currency, Category, Account, Note, Tags

**⛔ Out of Scope:**

- CSV import - V2
- PDF export - V2
- Scheduled exports - V2

### Key Deliverables

1. `GET /api/transactions/export.csv` endpoint
2. Settings page with export button
3. CSV generation logic
4. Export with date range filter
5. Download file naming convention

### Dependencies

- EPIC-03 (Transactions)
- EPIC-07 (Filtering)

---

## EPIC-10: Testing & Quality Assurance

### Epic Overview

**Business Objective:** Ensure reliability, accessibility, and performance meet PRD standards  
**PRD References:** Section 16 (Testing Strategy), NF-001 to NF-030  
**Milestone:** M5 (Weeks 11-12)  
**Priority:** P0 (Must-have)

### Success Metrics

- Unit test coverage >90%
- E2E test coverage for all critical user flows
- Zero critical accessibility violations (Axe)
- Lighthouse performance score >90
- All API endpoints <300ms (P95)

### Scope

**✅ In Scope:**

- Unit tests for validators and utilities
- Integration tests for API route handlers
- E2E tests for critical flows (Playwright)
- Accessibility testing (Axe)
- Performance testing (Lighthouse)
- Security testing (OWASP checklist)
- Load testing (10k users, 100 concurrent)
- Error boundary testing

**⛔ Out of Scope:**

- Penetration testing (professional audit) - Pre-production
- Chaos engineering - V2

### Key Deliverables

1. Unit tests (Vitest) for Zod validators
2. API integration tests (in-memory DB)
3. E2E tests (Playwright) for user flows
4. Accessibility tests (Axe DevTools)
5. Performance tests (Lighthouse CI)
6. Load tests (k6 or Artillery)
7. Security checklist completion (OWASP ASVS L1)
8. Error boundary components
9. Test documentation and CI integration

### Dependencies

- All feature epics (EPIC-02 to EPIC-07)

---

## Epic Dependencies Graph

```
EPIC-01 (Foundation)
    ↓
EPIC-02 (Auth) ← Must complete before other features
    ↓
    ├─→ EPIC-04 (Categories) ──┐
    ├─→ EPIC-05 (Accounts) ────┼──→ EPIC-03 (Transactions) ──┐
    │                          │                              │
    │                          └──────────────────────────────┼──→ EPIC-07 (Filtering)
    │                                                         │                ↓
    │                                                         └────────→ EPIC-06 (Dashboard)
    │                                                                            ↓
    └────────────────────────────────────────────────────────────────→ EPIC-10 (Testing)
                                                                                 ↓
    EPIC-08 (Budgets - Stretch) ──────────────────────────────→ V1.1
    EPIC-09 (Export - Stretch) ───────────────────────────────→ V1.1
```

---

## Next Steps

1. ✅ Review and approve epic definitions
2. ⏭️ Create detailed task breakdown for each epic (tasks/[epic]/[task].md)
3. ⏭️ Populate project management tool with tasks
4. ⏭️ Conduct team estimation session
5. ⏭️ Create sprint plan for M1-M5
6. ⏭️ Begin development with EPIC-01
