BudgetBuddy – Requirements Document (for PRD derivation)

Goal: Define clear, build-ready requirements for a non-AI personal finance web app implemented as a coupled Next.js project (frontend + backend in one codebase). This document is the upstream artifact from which you’ll derive a formal PRD, architecture doc, task plan, and test plans.

⸻

1. Product Overview

Summary: BudgetBuddy helps individuals log income/expenses, categorize them, and visualize spending trends over time.

Primary Value:
• Quick capture of transactions
• Clear visibility of spending by category and over time
• Lightweight budgets and alerts (stretch)

Target Users: Individuals and solo professionals who want a simple, privacy-respecting tracker.

Non-Goals (V1):
• Bank account aggregation
• Multi-currency or FX conversions
• AI features (classification, forecasting)
• Complex accounting (double-entry ledger, reconciliation)

⸻

2. Core User Flows (V1)
   1. Create Transaction
      • User selects date, amount, type (expense/income), category, account (cash/card), optional note & tags.
   2. Edit/Delete Transaction
      • User updates or removes past entries.
   3. Categorize Spending
      • User assigns or bulk reassigns categories; manages custom categories.
   4. View Trends
      • User sees totals by month and by category; simple cash-flow line chart and category donut/bar.
   5. Budgets (Stretch)
      • Set a monthly target per category and see progress vs. target.
   6. Recurring (Stretch)
      • Define recurring transactions (e.g., rent), auto-instantiated monthly with reminders.

⸻

3. Personas & Key Jobs-To-Be-Done
   • Aida (Budget Beginner): “Help me see where my money goes each month.”
   • Marko (Side-Hustler): “Track income vs. expenses across categories and months.”
   • Lejla (Health-Conscious Spender): “Separate groceries vs. dining out; keep an eye on limits.”

JTBD:
• When I’m paying or right after (mobile), I want to log a transaction in <10s.
• At month-end (desktop), I want to see totals by category and spot anomalies fast.

⸻

4. Functional Requirements

4.1 Authentication & Accounts
• Email/password auth (NextAuth credentials).
• Session persistence; logout.
• Single workspace per user (V1). (Multi-user later.)

4.2 Transactions
• Create: amount, currency (default: EUR), date, type (expense|income), category_id, account_id, note (opt), tags (opt), attachment_url (opt).
• Edit/Delete: allowable if created by the user.
• Bulk actions: bulk category reassignment and delete (multi-select).
• Validation: positive amounts; date not in future (configurable).

4.3 Categories
• System defaults (e.g., Groceries, Dining, Rent, Utilities, Transport, Entertainment, Health, Income: Salary, Income: Other).
• CRUD custom categories (name, color, type: expense|income).
• Prevent deletion if in use unless reassign target is provided.

4.4 Accounts (simple “wallets”)
• Defaults: “Cash”, “Card”.
• CRUD additional accounts (e.g., “Biz Card”).
• Balance is derived (not stored) from transactions.

4.5 Reporting & Charts
• Dashboard:
• This month spend total; top 3 categories.
• Charts:
• Category distribution (donut) for a selected period
• Monthly cash-flow (income minus expense) as a line chart
• Filters: date range presets (This Month, Last Month, Custom), account filter, type filter.

4.6 Budgets (Stretch)
• Monthly per category target; show used %, remaining, and simple alert state (OK/Warn/Over).

4.7 Recurring Transactions (Stretch)
• Define schedule (monthly on day N).
• Auto-create draft transaction each cycle; user confirms or auto-confirms (setting).

4.8 Data Export/Import (Stretch)
• Export CSV of transactions.
• Import CSV with basic mapping (date, amount, category, note).

⸻

5. Non-Functional Requirements
   • Performance: TTI < 2s on broadband; P95 API < 300ms for typical queries.
   • Availability: Single region; expected uptime 99%.
   • Security: OWASP ASVS L1, password hashing (bcrypt/argon2), CSRF protection, rate limiting.
   • Privacy: No third-party analytics in V1 (optional self-hosted later).
   • Accessibility: WCAG 2.1 AA basics (labels, focus states, color contrast).
   • Internationalization: Copy isolated for future i18n; currency fixed to EUR in V1.
   • Observability: Basic request logging, error tracking.
   • Scalability: Single Postgres instance; suitable for 10k users V1.

⸻

6. Information Architecture & Navigation
   • /login, /signup
   • / (Dashboard) – period filters, charts, KPIs
   • /transactions – list with search/filter; FAB to add
   • /transactions/new – form
   • /categories – manage categories (color pickers)
   • /accounts – manage accounts
   • /budgets (stretch)
   • /settings – profile, export (stretch)

⸻

7. Data Model (ERD & Schema)

erDiagram
User ||--o{ Account : owns
User ||--o{ Category : owns
User ||--o{ Transaction : owns
User ||--o{ Budget : owns
Account ||--o{ Transaction : has
Category ||--o{ Transaction : classifies

User {
uuid id PK
string email
string password_hash
string name
timestamp created_at
}

Account {
uuid id PK
uuid user_id FK
string name
string color
timestamp created_at
}

Category {
uuid id PK
uuid user_id FK
string name
string color
string type // 'expense' | 'income'
boolean is_system
timestamp created_at
}

Transaction {
uuid id PK
uuid user_id FK
uuid account_id FK
uuid category_id FK
numeric amount
string currency // 'EUR'
string type // 'expense' | 'income'
date txn_date
string note
string[] tags
string attachment_url
timestamp created_at
timestamp updated_at
}

Budget {
uuid id PK
uuid user_id FK
uuid category_id FK
integer year
integer month // 1..12
numeric target_amount
timestamp created_at
}

Prisma (illustrative):

model User {
id String @id @default(uuid())
email String @unique
passwordHash String
name String?
createdAt DateTime @default(now())
accounts Account[]
categories Category[]
transactions Transaction[]
budgets Budget[]
}

model Account {
id String @id @default(uuid())
userId String
name String
color String @default("#6b7280")
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
txns Transaction[]
@@index([userId, name])
}

enum CategoryType { expense income }

model Category {
id String @id @default(uuid())
userId String
name String
color String @default("#22c55e")
type CategoryType
isSystem Boolean @default(false)
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
txns Transaction[]
@@index([userId, type, name])
}

enum TxnType { expense income }

model Transaction {
id String @id @default(uuid())
userId String
accountId String
categoryId String
amount Decimal
currency String @default("EUR")
type TxnType
txnDate DateTime
note String?
tags String[]
attachmentUrl String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
user User @relation(fields: [userId], references: [id])
account Account @relation(fields: [accountId], references: [id])
category Category @relation(fields: [categoryId], references: [id])
@@index([userId, txnDate])
@@index([userId, categoryId])
}

model Budget {
id String @id @default(uuid())
userId String
categoryId String
year Int
month Int
targetAmount Decimal
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
category Category @relation(fields: [categoryId], references: [id])
@@unique([userId, categoryId, year, month])
}

⸻

8. API Surface (Next.js Route Handlers) & Server Actions

V1 can use route handlers under /api/\* plus Server Actions for form submissions.

8.1 Auth
• POST /api/auth/signup → { email, password, name }
• POST /api/auth/signin → { email, password }
• POST /api/auth/signout

8.2 Transactions
• GET /api/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&accountId=&categoryId=&type=&q=
• POST /api/transactions → { amount, type, txnDate, categoryId, accountId, note?, tags?, attachmentUrl? }
• PATCH /api/transactions/:id
• DELETE /api/transactions/:id
• Bulk: POST /api/transactions/bulk/reassign → { ids: string[], categoryId }
• Export (stretch): GET /api/transactions/export.csv

8.3 Categories
• GET /api/categories
• POST /api/categories → { name, color?, type }
• PATCH /api/categories/:id
• DELETE /api/categories/:id?reassignTo=<id>

8.4 Accounts
• GET /api/accounts
• POST /api/accounts → { name, color? }
• PATCH /api/accounts/:id
• DELETE /api/accounts/:id?reassignTo=<id>

8.5 Reporting
• GET /api/reports/summary?from=&to= → { totalIncome, totalExpense, net }
• GET /api/reports/by-category?from=&to= → [{ categoryId, total }]
• GET /api/reports/cashflow?start=YYYY-MM&months=6 → [{ month: "2025-01", income, expense, net }]

8.6 Budgets (Stretch)
• GET /api/budgets?year=&month=
• POST /api/budgets → { categoryId, year, month, targetAmount }
• GET /api/budgets/progress?year=&month= → [{ categoryId, target, spent, status }]

Errors: JSON { error: { code, message, details? } }, HTTP semantics (400/401/403/404/409/422/500).

⸻

9. Coupled Next.js Project Structure

/app
/(public)/
page.tsx # Dashboard
/transactions
page.tsx # List
/new/page.tsx # Create form (Server Action)
/[id]/edit/page.tsx
/categories/page.tsx
/accounts/page.tsx
/settings/page.tsx
/api
/auth/[...nextauth]/route.ts
/transactions/route.ts
/transactions/[id]/route.ts
/transactions/bulk/reassign/route.ts
/categories/route.ts
/categories/[id]/route.ts
/accounts/route.ts
/accounts/[id]/route.ts
/reports/summary/route.ts
/reports/by-category/route.ts
/reports/cashflow/route.ts
/components
TransactionForm.tsx
TransactionTable.tsx
FiltersBar.tsx
Charts/{Donut.tsx, Line.tsx}
/lib
db.ts # Prisma client
auth.ts # NextAuth config
validators.ts # Zod schemas
analytics.ts # (optional)
/styles
/tests
/prisma
schema.prisma
seed.ts

UI kit: Tailwind + shadcn/ui.
Charts: Recharts (client components).
Forms: React Hook Form + Zod resolver.
Data fetching: Server Components + RSC fetch; mutate via Server Actions or route handlers.

⸻

10. UX Requirements
    • Fast add: “+ Add transaction” button sticky on /transactions, opens side drawer form on desktop; full-screen on mobile.
    • Editing: Row click opens edit drawer; keyboard shortcuts (e.g., N for New, ⌘/Ctrl+K quick-add).
    • Filters: Persisted in URL query; defaults to This Month.
    • Empty states: Friendly guidance + CTA to add first transaction/category.
    • Charts:
    • Donut for category split with legend (top N + “Other”)
    • Line chart for cash-flow over N months (configurable)
    • Accessibility: All interactive elements keyboard-navigable; visible focus.

⸻

11. Validation & Business Rules
    • Transaction.amount > 0 (Decimal(12,2)).
    • Transaction.type must match Category.type.
    • Cannot delete Category with linked transactions without reassignTo.
    • Budget unique per (user, category, year, month).
    • Deleting an Account requires reassigning its transactions.
    • Only resource owner can access/modify (user scoping on all queries).

⸻

12. Security & Compliance
    • NextAuth with credentials: PBKDF2/Argon2/Bcrypt hashing (library default).
    • Session cookies: HttpOnly, SameSite=Lax, Secure in prod.
    • CSRF protection on mutations (NextAuth + same-site cookies).
    • Rate limiting on auth and mutation routes (middleware).
    • File uploads (if enabled) validated by type/size; stored in S3-compatible bucket (private).
    • PII: email only; no financial account numbers.
    • GDPR-friendly: user can delete account and all data (hard delete).

⸻

13. Observability & Admin
    • Logs: structured (route, userId, status, duration).
    • Errors: capture stack traces; user-friendly error boundaries.
    • Health check: /api/health returns DB connectivity.
    • Admin (later): toggle system categories, view metrics.

⸻

14. Seeding, Migrations, Defaults
    • Migrations: Prisma migrate with CI check.
    • Seed data:
    • Accounts: “Cash”, “Card”
    • Categories: defaults for expense & income
    • Demo transactions for this month and last month (dev only)
    • Feature flags: env-based for Budgets/Recurring/Export.

⸻

15. Analytics (Optional, privacy-respecting)
    • Self-hosted plausible/umami toggle; no PII; page + event tracking (transaction_created, category_created).

⸻

16. Testing Strategy
    • Unit: Zod validators, utils.
    • Integration: Route handlers (with in-memory DB or test schema).
    • E2E: Playwright flows: sign up → add transaction → edit → filter → charts render.
    • Accessibility checks: axe on key pages.
    • Performance: Lighthouse budget on critical pages.

Key Acceptance Criteria (samples):
• Create transaction from /transactions in ≤ 3 steps; appears in list and dashboard totals immediately.
• Deleting a category with existing transactions prompts reassign and succeeds with data preserved.
• Reports endpoints return correct totals within ±0.01 EUR across randomized seeds.

⸻

17. Roadmap & Milestones

Milestone 1 – Foundations (2–3 days)
• Next.js app, Tailwind, shadcn/ui, Prisma, NextAuth
• Schema + migrations + seeds
• Sign up/in/out; protected routes

Milestone 2 – Transactions (2–3 days)
• Transactions list, filters, create/edit/delete, bulk reassign
• Basic validations & scoping

Milestone 3 – Categories & Accounts (1–2 days)
• CRUD + guard rails (reassign on delete)

Milestone 4 – Reporting (2 days)
• Summary, by-category, cash-flow APIs + charts on dashboard

Milestone 5 – Polish & Tests (2 days)
• A11y pass, E2E tests, export CSV (stretch)

Stretch: Budgets, Recurring, Import CSV, i18n, multi-currency, mobile gestures.

⸻

18. “Vibe Code” Guardrails (DX & Style)
    • Domain-first naming: Transaction, Category, Account, Budget.
    • Folder hygiene: colocate components with feature folders; keep /lib small and generic.
    • Type safety: Zod schemas for inputs; infer types; no any.
    • UI language: concise; sentence case; numbers formatted with Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).
    • Commit style: Conventional Commits (feat:, fix:, chore:).
    • Lint/test gates: pnpm lint && pnpm test required before merge.
    • Design tokens: spacing 4/8px scale; rounding rounded-2xl; neutral grays + accent color per category.
    • Empty states & toasts: always provide feedback; never dead-end a user.

⸻

19. Open Questions (to resolve in PRD)
    • Do we want multi-currency in near term (user base outside EUR)?
    • Should budgets be V1 or V1.1?
    • Any CSV import constraints (column mapping presets)?
    • Do we need soft delete for transactions?
    • Mobile first or parity? (Default: responsive with parity.)

⸻

Appendix A – Example Calculations
• Category total (period): sum(amount) for type='expense' grouped by category within from..to.
• Cash-flow monthly:
• income_m = sum(income where month= m)
• expense_m = sum(expense where month= m)
• net_m = income_m - expense_m
• Budget status: status = if spent < 0.8\*target → OK; else if spent <= target → WARN; else OVER.
