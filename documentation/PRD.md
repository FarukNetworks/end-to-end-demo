# BudgetBuddy – Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** October 24, 2025  
**Status:** Draft  
**Author:** Product Team  
**Stakeholders:** Engineering, Design, QA, Business

---

## 1. Executive Summary & Business Context

### 1.1 Problem Statement

Individuals and solo professionals struggle to maintain visibility into their spending patterns, leading to poor financial awareness and inability to meet savings goals. Existing personal finance tools either require bank account integration (raising privacy concerns) or are overly complex with features users don't need. **60% of surveyed users** cite privacy concerns with current financial apps, while **73%** report abandoning finance tracking due to complexity.

BudgetBuddy addresses this gap by providing a **lightweight, privacy-first, manual transaction tracker** that enables users to log income and expenses, categorize spending, and visualize trends in under 10 seconds per transaction.

### 1.2 Business Objectives and Success Metrics

| Objective        | Success Metric                    | Baseline | Target (6 months)       |
| ---------------- | --------------------------------- | -------- | ----------------------- |
| User Engagement  | Weekly active transaction logging | 0        | 70% of registered users |
| User Acquisition | Total registered users            | 0        | 10,000 users            |
| Retention        | 30-day retention rate             | 0        | 60%                     |
| Performance      | Time to log transaction           | N/A      | < 10 seconds            |
| Reliability      | System uptime                     | N/A      | 99%                     |

### 1.3 Target Personas and Market Opportunity

**Primary Personas:**

1. **Aida (Budget Beginner)** - 24-35 years old, early career, wants basic spending visibility
2. **Marko (Side-Hustler)** - 28-40 years old, multiple income streams, needs income vs. expense tracking
3. **Lejla (Health-Conscious Spender)** - 30-45 years old, focused on category-specific budgets

**Market Opportunity:**

- Target market: EU-based individuals seeking privacy-respecting finance tools
- Market size: ~50M potential users in DACH region
- Initial focus: Germany, Austria, Switzerland (EUR currency)

### 1.4 Competitive Landscape and Differentiation

| Competitor             | Strength         | Weakness                          | BudgetBuddy Advantage            |
| ---------------------- | ---------------- | --------------------------------- | -------------------------------- |
| Mint                   | Feature-rich     | Requires bank linking, US-focused | Privacy-first, no bank access    |
| YNAB                   | Strong budgeting | Complex, expensive ($99/yr)       | Simpler, free V1                 |
| Excel/Sheets           | Full control     | No insights, manual charts        | Automated visualizations         |
| Wallet by BudgetBakers | Mobile-first     | Complex, many unused features     | Lightweight, focused feature set |

**Key Differentiators:**

- Zero bank integration (privacy-first)
- Sub-10-second transaction logging
- Coupled Next.js architecture (faster development, better performance)
- Free tier with essential features

### 1.5 High-Level Timeline and Resource Requirements

**Timeline:** 12 weeks (3 months)

- Milestone 1 (Weeks 1-2): Foundations
- Milestone 2 (Weeks 3-5): Transactions
- Milestone 3 (Weeks 6-7): Categories & Accounts
- Milestone 4 (Weeks 8-10): Reporting & Charts
- Milestone 5 (Weeks 11-12): Polish & Testing

**Resource Requirements:**

- 2 Full-stack Engineers (Next.js, React, Prisma, PostgreSQL)
- 1 UI/UX Designer (shadcn/ui, Tailwind)
- 1 QA Engineer (Playwright, accessibility testing)
- 1 Product Manager

---

## 2. User Research & Personas

### 2.1 Primary User Personas

#### Persona 1: Aida (Budget Beginner)

**Demographics:**

- Age: 28
- Occupation: Marketing Coordinator
- Location: Munich, Germany
- Income: €42,000/year
- Tech Savviness: Medium

**Motivations:**

- Wants to understand where monthly salary goes
- Preparing to save for apartment deposit
- Frustrated with bank statements (too detailed, no insights)

**Pain Points:**

- Finds traditional finance apps overwhelming
- Doesn't trust apps with bank credentials
- Needs simple overview, not detailed accounting

**Goals:**

- See monthly spending by category
- Identify areas to reduce spending
- Track progress toward savings goals

**Job-to-be-Done:**
"When I get paid at month-start, I want to see last month's spending breakdown so I can identify where to cut back and set this month's savings target."

---

#### Persona 2: Marko (Side-Hustler)

**Demographics:**

- Age: 34
- Occupation: Freelance Developer + Consulting
- Location: Vienna, Austria
- Income: €65,000/year (variable)
- Tech Savviness: High

**Motivations:**

- Tracks multiple income streams
- Separates business vs. personal expenses
- Needs cash-flow visibility for tax planning

**Pain Points:**

- Spreadsheets require too much manual work
- Existing apps don't separate income types well
- Needs quick mobile entry between meetings

**Goals:**

- Log transactions in <10 seconds on mobile
- Compare income vs. expenses monthly
- Export data for tax accountant

**Job-to-be-Done:**
"When I receive client payment or pay business expense, I want to quickly log it with correct category so my monthly cash-flow is always accurate."

---

#### Persona 3: Lejla (Health-Conscious Spender)

**Demographics:**

- Age: 38
- Occupation: Healthcare Administrator
- Location: Zurich, Switzerland
- Income: CHF 85,000/year (~€80,000)
- Tech Savviness: Medium-High

**Motivations:**

- Manages household budget carefully
- Distinguishes groceries vs. dining out
- Monitors discretionary spending categories

**Pain Points:**

- Generic categories don't match her spending patterns
- Wants alerts before exceeding category budgets
- Needs monthly comparisons to track improvements

**Goals:**

- Custom categories for her spending style
- Visual breakdown of category spending
- Optional budget limits with alerts (stretch)

**Job-to-be-Done:**
"When I review my month, I want to see how much I spent on groceries vs. dining out so I can adjust my habits to meet my health and financial goals."

### 2.2 User Journey Maps

#### Journey 1: New User Onboarding & First Transaction

| Stage             | User Action                                                | System Response                                | User Emotion | Pain Points                           |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------------- | ------------ | ------------------------------------- |
| Discover          | Hears about BudgetBuddy from friend                        | N/A                                            | Curious      | Skeptical about "another finance app" |
| Sign Up           | Visits site, creates account (email/password)              | Account created, redirected to dashboard       | Hopeful      | Concerned about privacy               |
| Onboarding        | Sees empty dashboard with "Add your first transaction" CTA | Displays friendly empty state                  | Motivated    | Unsure where to start                 |
| First Transaction | Clicks "+ Add Transaction", fills form (€45 groceries)     | Transaction saved, appears in list & dashboard | Accomplished | Wants confirmation it worked          |
| Exploration       | Views dashboard, sees category donut chart updating        | Chart displays spending breakdown              | Satisfied    | Wants to add more data                |
| Return            | Comes back next day to add 3 more transactions             | Sees updated totals and charts                 | Engaged      | N/A                                   |

**Success Metrics:**

- 80% of new users log first transaction within 5 minutes
- 60% return within 24 hours to add more transactions

---

#### Journey 2: Monthly Review & Budget Adjustment

| Stage     | User Action                                          | System Response                                   | User Emotion | Pain Points                   |
| --------- | ---------------------------------------------------- | ------------------------------------------------- | ------------ | ----------------------------- |
| Trigger   | Month-end reminder or payday arrives                 | N/A                                               | Reflective   | Anxious about overspending    |
| Navigate  | Opens app, goes to dashboard                         | Shows "This Month" totals and charts              | Curious      | Wants quick overview          |
| Analyze   | Reviews category breakdown (donut chart)             | Highlights top 3 spending categories              | Informed     | Some categories unclear       |
| Deep Dive | Filters transactions by "Dining Out" category        | Shows all dining transactions with dates/amounts  | Concerned    | Realizes overspending         |
| Adjust    | Decides to create custom category "Coffee Shops"     | Creates new category, bulk reassigns transactions | Empowered    | Manual reassignment tedious   |
| Plan      | (Stretch) Sets €150 budget for Dining Out next month | Budget created with progress bar                  | Motivated    | Wants alerts before exceeding |

**Success Metrics:**

- 50% of users review dashboard at least monthly
- Average session duration during review: 5-8 minutes

### 2.3 Research Findings and Validation Data

**Research Methods:**

- 15 user interviews (30-45 min each)
- Survey of 120 potential users
- Competitive app analysis (6 apps tested)
- Usability testing with paper prototypes

**Key Findings:**

1. **Transaction Logging Speed is Critical**

   - 92% cited "too slow to log" as reason for abandoning previous apps
   - Target: <10 seconds from opening app to transaction saved
   - Mobile accessibility essential (67% log transactions on-the-go)

2. **Privacy Concerns Dominate**

   - 89% uncomfortable linking bank accounts
   - Manual entry preferred despite extra effort
   - Strong preference for self-hosted or EU-based hosting

3. **Category Customization Matters**

   - 78% want custom categories beyond defaults
   - Top custom categories: Coffee, Pet Care, Subscriptions, Gifts
   - Color-coding categories aids quick scanning

4. **Visualization Drives Engagement**

   - Users with chart access logged 3.2x more transactions
   - Donut charts preferred over bar charts for categories (62% preference)
   - Monthly cash-flow trends motivate continued use

5. **Simplicity Over Features**
   - 71% prefer "fewer features done well" vs. comprehensive apps
   - Core loop: Add → Categorize → View → Repeat
   - Advanced features (budgets, recurring) can wait for V2

### 2.4 Use Cases and User Stories

**Epic 1: Transaction Management**

**US-001:** As Aida, I want to log an expense in under 10 seconds so I can capture it immediately after making a purchase without disrupting my day.

- **Acceptance Criteria:** Transaction form accessible within 2 clicks from any page; form prefills date to today; save completes in <2 seconds.

**US-002:** As Marko, I want to edit a transaction I logged incorrectly so I can maintain accurate records without deleting and re-entering.

- **Acceptance Criteria:** Click transaction row to open edit drawer; all fields editable; changes save immediately; transaction remains in list.

**US-003:** As Lejla, I want to delete multiple transactions at once so I can quickly remove test entries or duplicate mistakes.

- **Acceptance Criteria:** Multi-select checkboxes on transaction list; bulk delete button appears when ≥2 selected; confirmation modal prevents accidents.

---

**Epic 2: Categorization**

**US-004:** As Lejla, I want to create custom categories with colors so I can organize spending to match my personal budget structure.

- **Acceptance Criteria:** Categories page has "+ Add Category" button; form accepts name, color picker, type (expense/income); category appears immediately in dropdowns.

**US-005:** As Aida, I want to reassign multiple transactions to a different category so I can correct bulk categorization mistakes quickly.

- **Acceptance Criteria:** Multi-select transactions; "Change Category" action appears; dropdown shows all categories; reassignment updates all selected.

**US-006:** As Marko, I want system default categories pre-populated so I can start logging transactions immediately without setup.

- **Acceptance Criteria:** New users see 8-10 default categories (Groceries, Dining, Transport, etc.); defaults marked as "system" and cannot be deleted.

---

**Epic 3: Reporting & Insights**

**US-007:** As Aida, I want to see my total spending this month on the dashboard so I can quickly check if I'm on track without navigating.

- **Acceptance Criteria:** Dashboard displays "This Month" total expense; updates in real-time when transactions added; shows comparison to last month (+/- %).

**US-008:** As Lejla, I want to view a category breakdown chart so I can visually identify my largest spending areas.

- **Acceptance Criteria:** Donut chart shows category distribution; legend lists categories with percentages; clicking slice filters transactions to that category.

**US-009:** As Marko, I want to see monthly cash-flow (income - expenses) over time so I can track profitability trends for my freelance work.

- **Acceptance Criteria:** Line chart shows 6 months of data; Y-axis is net cash-flow; positive months in green, negative in red; hovering shows exact values.

---

**Epic 4: Accounts**

**US-010:** As Marko, I want to track transactions across multiple accounts (business card, personal cash) so I can separate business vs. personal finances.

- **Acceptance Criteria:** Accounts page allows CRUD operations; transaction form includes account dropdown; filters support "show only Business Card transactions."

**US-011:** As Aida, I want to see derived account balances so I know how much cash or card balance I have without manual calculation.

- **Acceptance Criteria:** Accounts page shows calculated balance per account; balance = sum(income) - sum(expense) for that account.

---

**Epic 5: Budgets (Stretch)**

**US-012:** As Lejla, I want to set a monthly budget per category so I can get alerts before overspending in problem areas.

- **Acceptance Criteria:** Budget form accepts category, month, target amount; dashboard shows progress bar (used/target); status indicator (OK/Warn/Over).

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

**FR-001:** When a user visits `/signup`, the system shall display an email/password registration form with name (optional), email (required, validated), and password (required, ≥8 characters) fields.

- **Given** a user navigates to `/signup`
- **When** they submit valid email and password
- **Then** account is created, user is redirected to dashboard, and session is established
- **Priority:** Must-have
- **Dependencies:** None

**FR-002:** When a user submits the signup form with an email already registered, the system shall return a 409 Conflict error with message "Email already registered."

- **Given** user submits signup form
- **When** email exists in database
- **Then** form displays error message "Email already registered" without revealing password hash
- **Priority:** Must-have
- **Dependencies:** FR-001

**FR-003:** When a user visits `/login`, the system shall display an email/password login form and authenticate against stored credentials using NextAuth.

- **Given** a registered user navigates to `/login`
- **When** they submit correct email and password
- **Then** session is created, user is redirected to dashboard
- **Priority:** Must-have
- **Dependencies:** FR-001

**FR-004:** When a user submits login form with incorrect credentials, the system shall return a 401 Unauthorized error with generic message "Invalid credentials" (no email/password distinction).

- **Given** user submits login form
- **When** email or password is incorrect
- **Then** form displays "Invalid credentials" error without revealing which field is wrong
- **Priority:** Must-have
- **Dependencies:** FR-003

**FR-005:** When an authenticated user clicks "Logout," the system shall invalidate the session and redirect to `/login`.

- **Given** user is logged in
- **When** they click logout button
- **Then** session is destroyed, user redirected to login page, protected routes become inaccessible
- **Priority:** Must-have
- **Dependencies:** FR-003

**FR-006:** When an unauthenticated user attempts to access a protected route, the system shall redirect to `/login` with a return URL parameter.

- **Given** user is not logged in
- **When** they navigate to `/transactions` or other protected route
- **Then** they are redirected to `/login?from=/transactions` and returned after successful login
- **Priority:** Must-have
- **Dependencies:** FR-003

---

### 3.2 Transaction Management

**FR-007:** When a user clicks "+ Add Transaction" from any page, the system shall open a transaction form (drawer on desktop, full-screen on mobile) with fields: amount (required), type (expense/income toggle, default: expense), date (required, default: today), category (dropdown, required), account (dropdown, required), note (optional), tags (optional, comma-separated).

- **Given** user clicks "+ Add Transaction" button
- **When** form opens
- **Then** all fields are rendered, date prefilled to today, type defaulted to expense, category shows user's categories + system defaults
- **Priority:** Must-have
- **Dependencies:** FR-001, FR-015, FR-023

**FR-008:** When a user submits a transaction form with valid data, the system shall save the transaction to the database, display success toast "Transaction added," close the form, and refresh the transaction list and dashboard totals.

- **Given** user fills valid transaction data
- **When** they click "Save"
- **Then** transaction is created in DB with userId, appears in transaction list, dashboard totals update, form closes, success toast appears
- **Priority:** Must-have
- **Dependencies:** FR-007

**FR-009:** When a user submits a transaction form with invalid data (amount ≤ 0, missing category, future date, or type mismatch with category), the system shall display field-level validation errors without saving.

- **Given** user submits transaction form
- **When** amount ≤ 0 OR category missing OR date > today OR type ≠ category.type
- **Then** form displays inline error messages, data is not saved, form remains open
- **Priority:** Must-have
- **Dependencies:** FR-007

**FR-010:** When a user clicks a transaction row in the transaction list, the system shall open an edit form pre-populated with the transaction's current values.

- **Given** user is viewing transaction list
- **When** they click a transaction row
- **Then** edit drawer opens with all fields prefilled, "Save" and "Delete" buttons available
- **Priority:** Must-have
- **Dependencies:** FR-007, FR-008

**FR-011:** When a user updates a transaction and clicks "Save," the system shall update the transaction in the database, refresh the list and dashboard, display "Transaction updated" toast, and close the form.

- **Given** user edits transaction fields
- **When** they click "Save" with valid data
- **Then** transaction is updated in DB, updatedAt timestamp set, list and dashboard refresh, success toast appears
- **Priority:** Must-have
- **Dependencies:** FR-010

**FR-012:** When a user clicks "Delete" in the transaction edit form, the system shall display a confirmation modal "Delete this transaction? This cannot be undone." with Cancel and Confirm buttons.

- **Given** user is editing a transaction
- **When** they click "Delete" button
- **Then** confirmation modal appears with transaction amount and category displayed
- **Priority:** Must-have
- **Dependencies:** FR-010

**FR-013:** When a user confirms transaction deletion, the system shall remove the transaction from the database, refresh the list and dashboard, display "Transaction deleted" toast, and close the form.

- **Given** user clicks "Confirm" in delete confirmation modal
- **When** confirmation is submitted
- **Then** transaction is hard-deleted from DB, list and dashboard update, success toast appears, form closes
- **Priority:** Must-have
- **Dependencies:** FR-012

**FR-014:** When a user selects multiple transactions via checkboxes and clicks "Bulk Delete," the system shall display a confirmation modal "Delete {N} transactions? This cannot be undone." and delete all selected transactions upon confirmation.

- **Given** user selects ≥2 transactions via checkboxes
- **When** they click "Bulk Delete" and confirm
- **Then** all selected transactions are deleted, list refreshes, toast shows "{N} transactions deleted"
- **Priority:** Should-have
- **Dependencies:** FR-008

**FR-015:** When a user selects multiple transactions and clicks "Change Category," the system shall display a category dropdown and reassign all selected transactions to the chosen category upon confirmation.

- **Given** user selects ≥2 transactions
- **When** they click "Change Category," select new category, and confirm
- **Then** all selected transactions updated with new categoryId, list refreshes, toast shows "{N} transactions updated"
- **Priority:** Should-have
- **Dependencies:** FR-008, FR-018

---

### 3.3 Category Management

**FR-016:** When a new user account is created, the system shall auto-create system default categories: Groceries, Dining Out, Transport, Utilities, Rent, Entertainment, Health, Shopping (all type: expense), and Salary, Other Income (type: income), each with a default color and isSystem=true.

- **Given** user completes signup
- **When** account creation completes
- **Then** 10 system categories are created and linked to userId, visible in category dropdown immediately
- **Priority:** Must-have
- **Dependencies:** FR-001

**FR-017:** When a user navigates to `/categories`, the system shall display a list of all categories (system + custom) grouped by type (expense/income) with color swatches, names, and action buttons (Edit, Delete).

- **Given** user navigates to `/categories`
- **When** page loads
- **Then** categories are listed, grouped by type, sorted alphabetically, with color indicators and action buttons
- **Priority:** Must-have
- **Dependencies:** FR-016

**FR-018:** When a user clicks "+ Add Category" on the categories page, the system shall open a form with fields: name (required), type (expense/income, required), color (color picker, default: #22c55e).

- **Given** user clicks "+ Add Category"
- **When** form opens
- **Then** fields are rendered, type defaults to expense, color picker shows current color, save button enabled
- **Priority:** Must-have
- **Dependencies:** FR-017

**FR-019:** When a user submits a category form with valid data, the system shall create the category with isSystem=false, display "Category created" toast, refresh the category list, and make the category available in transaction forms immediately.

- **Given** user submits valid category data
- **When** form is submitted
- **Then** category is created in DB, list refreshes, category appears in transaction dropdown, toast confirms success
- **Priority:** Must-have
- **Dependencies:** FR-018

**FR-020:** When a user attempts to create a category with a name that already exists for their account (case-insensitive), the system shall return a 409 Conflict error with message "Category name already exists."

- **Given** user submits category form
- **When** name matches existing category (case-insensitive) for userId
- **Then** form displays error "Category name already exists," category is not created
- **Priority:** Must-have
- **Dependencies:** FR-018

**FR-021:** When a user clicks "Edit" on a custom category, the system shall open the category form pre-populated with current values, allowing edits to name and color (type is immutable).

- **Given** user clicks "Edit" on custom category
- **When** form opens
- **Then** name and color fields editable, type field disabled, save button enabled
- **Priority:** Must-have
- **Dependencies:** FR-017

**FR-022:** When a user clicks "Delete" on a system category, the system shall display a message "System categories cannot be deleted" and prevent deletion.

- **Given** user clicks "Delete" on category where isSystem=true
- **When** delete action is triggered
- **Then** error toast appears "System categories cannot be deleted," no deletion occurs
- **Priority:** Must-have
- **Dependencies:** FR-016, FR-017

**FR-023:** When a user clicks "Delete" on a custom category with linked transactions, the system shall display a modal "This category has {N} transactions. Reassign to:" with a category dropdown (excluding the current category) and Cancel/Confirm buttons.

- **Given** user clicks "Delete" on custom category
- **When** category has ≥1 linked transactions
- **Then** reassignment modal appears with dropdown of alternative categories, transaction count displayed
- **Priority:** Must-have
- **Dependencies:** FR-017

**FR-024:** When a user confirms category deletion with reassignment target, the system shall update all linked transactions to the new categoryId, delete the category, refresh the list, and display "{N} transactions reassigned, category deleted" toast.

- **Given** user selects reassignment target and confirms
- **When** deletion is submitted
- **Then** all transactions updated, category deleted, category list and transaction list refresh, toast confirms action
- **Priority:** Must-have
- **Dependencies:** FR-023

**FR-025:** When a user clicks "Delete" on a custom category with no linked transactions, the system shall display a simple confirmation modal "Delete this category? This cannot be undone." and delete upon confirmation.

- **Given** user clicks "Delete" on custom category with zero linked transactions
- **When** delete is triggered
- **Then** confirmation modal appears, category deleted on confirm, list refreshes, toast shows "Category deleted"
- **Priority:** Must-have
- **Dependencies:** FR-017

---

### 3.4 Account Management

**FR-026:** When a new user account is created, the system shall auto-create two default accounts: "Cash" and "Card," each with a default color and linked to userId.

- **Given** user completes signup
- **When** account creation completes
- **Then** "Cash" and "Card" accounts are created, visible in account dropdown and accounts page immediately
- **Priority:** Must-have
- **Dependencies:** FR-001

**FR-027:** When a user navigates to `/accounts`, the system shall display a list of all accounts with name, color swatch, derived balance (calculated as sum(income) - sum(expense) for transactions linked to that account), and action buttons (Edit, Delete).

- **Given** user navigates to `/accounts`
- **When** page loads
- **Then** accounts listed with calculated balances, sorted by creation date, action buttons available
- **Priority:** Must-have
- **Dependencies:** FR-026

**FR-028:** When a user clicks "+ Add Account" on the accounts page, the system shall open a form with fields: name (required), color (color picker, default: #6b7280).

- **Given** user clicks "+ Add Account"
- **When** form opens
- **Then** name and color fields rendered, save button enabled
- **Priority:** Must-have
- **Dependencies:** FR-027

**FR-029:** When a user submits an account form with valid data, the system shall create the account, display "Account created" toast, refresh the account list, and make the account available in transaction forms immediately.

- **Given** user submits valid account data
- **When** form is submitted
- **Then** account is created in DB, list refreshes, account appears in transaction dropdown, toast confirms success
- **Priority:** Must-have
- **Dependencies:** FR-028

**FR-030:** When a user attempts to create an account with a name that already exists for their account (case-insensitive), the system shall return a 409 Conflict error with message "Account name already exists."

- **Given** user submits account form
- **When** name matches existing account (case-insensitive) for userId
- **Then** form displays error "Account name already exists," account is not created
- **Priority:** Must-have
- **Dependencies:** FR-028

**FR-031:** When a user clicks "Edit" on an account, the system shall open the account form pre-populated with current values, allowing edits to name and color.

- **Given** user clicks "Edit" on account
- **When** form opens
- **Then** name and color fields editable, save button enabled
- **Priority:** Must-have
- **Dependencies:** FR-027

**FR-032:** When a user clicks "Delete" on an account with linked transactions, the system shall display a modal "This account has {N} transactions. Reassign to:" with an account dropdown (excluding the current account) and Cancel/Confirm buttons.

- **Given** user clicks "Delete" on account
- **When** account has ≥1 linked transactions
- **Then** reassignment modal appears with dropdown of alternative accounts, transaction count displayed
- **Priority:** Must-have
- **Dependencies:** FR-027

**FR-033:** When a user confirms account deletion with reassignment target, the system shall update all linked transactions to the new accountId, delete the account, refresh the list, and display "{N} transactions reassigned, account deleted" toast.

- **Given** user selects reassignment target and confirms
- **When** deletion is submitted
- **Then** all transactions updated, account deleted, account list and transaction list refresh, toast confirms action
- **Priority:** Must-have
- **Dependencies:** FR-032

**FR-034:** When a user clicks "Delete" on an account with no linked transactions, the system shall display a simple confirmation modal "Delete this account? This cannot be undone." and delete upon confirmation.

- **Given** user clicks "Delete" on account with zero linked transactions
- **When** delete is triggered
- **Then** confirmation modal appears, account deleted on confirm, list refreshes, toast shows "Account deleted"
- **Priority:** Must-have
- **Dependencies:** FR-027

---

### 3.5 Transaction List & Filtering

**FR-035:** When a user navigates to `/transactions`, the system shall display a paginated list of transactions (most recent first) with columns: Date, Amount, Category (with color), Account, Note (truncated), and Actions (Edit, Delete).

- **Given** user navigates to `/transactions`
- **When** page loads
- **Then** transactions displayed in descending order by txnDate, paginated (50 per page), with all specified columns
- **Priority:** Must-have
- **Dependencies:** FR-008

**FR-036:** When a user applies filters (date range, account, category, type), the system shall update the URL query parameters and re-fetch transactions matching the filter criteria.

- **Given** user selects filter values (e.g., "This Month," "Card" account)
- **When** filters are applied
- **Then** URL updates to `/transactions?from=2025-10-01&to=2025-10-31&accountId=xyz`, list refreshes with filtered results
- **Priority:** Must-have
- **Dependencies:** FR-035

**FR-037:** When a user selects a date range preset ("This Month," "Last Month," "This Year," "Custom"), the system shall calculate the appropriate from/to dates and apply them to the filter.

- **Given** user clicks "This Month" preset
- **When** preset is selected
- **Then** from/to dates set to current month start/end, filter applied, URL updated
- **Priority:** Must-have
- **Dependencies:** FR-036

**FR-038:** When a user selects "Custom" date range, the system shall display date pickers for "From" and "To" dates, allowing manual date selection.

- **Given** user clicks "Custom" preset
- **When** preset is selected
- **Then** date picker inputs appear, user can select from/to dates, filter applies on change
- **Priority:** Must-have
- **Dependencies:** FR-037

**FR-039:** When a user types into the search field, the system shall filter transactions by matching the search query against note field (case-insensitive, partial match).

- **Given** user types "grocery" in search field
- **When** search input changes
- **Then** list filters to transactions where note contains "grocery" (case-insensitive), URL updates with `q=grocery`
- **Priority:** Should-have
- **Dependencies:** FR-035

---

### 3.6 Dashboard & Reporting

**FR-040:** When a user navigates to `/` (dashboard), the system shall display KPI cards for the selected period (default: This Month): Total Income, Total Expense, Net (Income - Expense), and Transaction Count.

- **Given** user navigates to dashboard
- **When** page loads with default "This Month" filter
- **Then** KPI cards display calculated totals with currency formatting (e.g., €1,234.56), comparison to previous period (+/- %)
- **Priority:** Must-have
- **Dependencies:** FR-001

**FR-041:** When a user selects a date range filter on the dashboard, the system shall recalculate KPIs and refresh all charts for the selected period.

- **Given** user changes date filter to "Last Month"
- **When** filter is applied
- **Then** KPIs recalculate, charts update, URL updates with date parameters
- **Priority:** Must-have
- **Dependencies:** FR-040

**FR-042:** When the dashboard renders the category breakdown chart, the system shall display a donut chart showing expense distribution by category for the selected period, with legend showing category names, amounts, and percentages.

- **Given** user has ≥1 expense transaction in selected period
- **When** dashboard loads
- **Then** donut chart renders with colored segments per category, legend lists categories sorted by amount descending, percentages calculated
- **Priority:** Must-have
- **Dependencies:** FR-040

**FR-043:** When a user clicks a category segment in the donut chart, the system shall navigate to `/transactions` with that category pre-filtered.

- **Given** user clicks "Groceries" segment in donut chart
- **When** segment is clicked
- **Then** user navigated to `/transactions?categoryId=xyz&from=...&to=...`, list shows only Groceries transactions
- **Priority:** Should-have
- **Dependencies:** FR-042, FR-035

**FR-044:** When the dashboard renders the cash-flow chart, the system shall display a line chart showing monthly net cash-flow (income - expense) for the last 6 months, with positive values in green and negative in red.

- **Given** user has transactions spanning multiple months
- **When** dashboard loads
- **Then** line chart renders with X-axis (months), Y-axis (EUR), data points for each month's net, color-coded by positive/negative
- **Priority:** Must-have
- **Dependencies:** FR-040

**FR-045:** When a user hovers over a data point in the cash-flow chart, the system shall display a tooltip showing the exact month, income, expense, and net values.

- **Given** user hovers over October 2025 data point
- **When** hover occurs
- **Then** tooltip appears with "Oct 2025: €2,500 income, €1,800 expense, €700 net"
- **Priority:** Should-have
- **Dependencies:** FR-044

**FR-046:** When the dashboard has no transactions for the selected period, the system shall display an empty state message "No transactions yet. Add your first transaction to see insights!" with a "+ Add Transaction" CTA button.

- **Given** user has zero transactions in selected period
- **When** dashboard loads
- **Then** empty state displayed with friendly illustration, CTA button opens transaction form
- **Priority:** Must-have
- **Dependencies:** FR-040

---

### 3.7 Budgets (Stretch - V1.1)

**FR-047:** When a user navigates to `/budgets`, the system shall display a list of budgets grouped by month, showing category, target amount, spent amount, remaining, and status (OK/Warn/Over).

- **Given** user has ≥1 budget defined
- **When** they navigate to `/budgets`
- **Then** budgets listed with progress bars, status indicators, sorted by month descending
- **Priority:** Could-have
- **Dependencies:** FR-001

**FR-048:** When a user clicks "+ Add Budget," the system shall open a form with fields: category (dropdown), month (picker), target amount (required, positive).

- **Given** user clicks "+ Add Budget"
- **When** form opens
- **Then** fields rendered, month defaults to current month, category shows expense categories only
- **Priority:** Could-have
- **Dependencies:** FR-047

**FR-049:** When a user submits a budget form, the system shall validate uniqueness (userId, categoryId, year, month) and create the budget, displaying "Budget created" toast.

- **Given** user submits valid budget data
- **When** form is submitted
- **Then** budget created in DB, list refreshes, dashboard shows budget progress (if applicable)
- **Priority:** Could-have
- **Dependencies:** FR-048

**FR-050:** When the system calculates budget status, it shall apply the following rules: spent < 80% target → OK (green), 80% ≤ spent ≤ 100% → Warn (yellow), spent > 100% → Over (red).

- **Given** user has budget with target €500, spent €450
- **When** budget progress is calculated
- **Then** status is "Warn" (90% of target), progress bar yellow, remaining €50
- **Priority:** Could-have
- **Dependencies:** FR-047

---

### 3.8 Data Export (Stretch - V1.1)

**FR-051:** When a user navigates to `/settings` and clicks "Export Transactions CSV," the system shall generate a CSV file containing all user transactions with columns: Date, Type, Amount, Currency, Category, Account, Note, Tags.

- **Given** user clicks "Export Transactions CSV"
- **When** export is triggered
- **Then** CSV file downloads with filename "budgetbuddy-transactions-YYYY-MM-DD.csv", contains all user transactions
- **Priority:** Could-have
- **Dependencies:** FR-001

**FR-052:** When a user initiates CSV export for a date range filter, the system shall include only transactions within the specified date range in the export.

- **Given** user has date filter "This Month" active
- **When** they click export
- **Then** CSV contains only transactions from current month, filename includes date range
- **Priority:** Could-have
- **Dependencies:** FR-051

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

**NF-001:** The dashboard page shall achieve Time to Interactive (TTI) < 2 seconds on broadband connections (≥5 Mbps) for users with ≤1000 transactions.

- **Measurement:** Lighthouse TTI metric
- **Target:** <2000ms at P95
- **Priority:** Must-have

**NF-002:** API route handlers shall respond within 300ms at P95 for typical queries (transactions list with filters, category list, account list).

- **Measurement:** Server-side logging of request duration
- **Target:** <300ms at P95, <500ms at P99
- **Priority:** Must-have

**NF-003:** The transaction creation API (POST /api/transactions) shall complete within 500ms at P95, including database write and response.

- **Measurement:** API route timing logs
- **Target:** <500ms at P95
- **Priority:** Must-have

**NF-004:** The dashboard charts (donut, line) shall render within 1 second after data fetch completes for datasets up to 500 data points.

- **Measurement:** React component render timing
- **Target:** <1000ms from data arrival to chart paint
- **Priority:** Must-have

**NF-005:** The transaction list pagination shall load each page (50 transactions) within 200ms at P95.

- **Measurement:** API response time + client rendering
- **Target:** <200ms at P95
- **Priority:** Should-have

### 4.2 Scalability and Reliability

**NF-006:** The system shall support up to 10,000 concurrent registered users in V1 with single PostgreSQL instance (no sharding required).

- **Measurement:** Load testing with 10k user accounts, 100 concurrent active sessions
- **Target:** No degradation in P95 response times
- **Priority:** Must-have

**NF-007:** The system shall maintain 99% uptime measured monthly, excluding planned maintenance windows (announced ≥24h in advance).

- **Measurement:** Uptime monitoring (e.g., UptimeRobot)
- **Target:** ≤7.2 hours downtime per month
- **Priority:** Must-have

**NF-008:** The database schema shall support up to 1 million transactions per user without performance degradation via appropriate indexing on (userId, txnDate) and (userId, categoryId).

- **Measurement:** Query performance testing with large datasets
- **Target:** Indexed queries <100ms at 1M records per user
- **Priority:** Should-have

**NF-009:** The system shall handle traffic spikes up to 5x normal load (e.g., month-end review peaks) without errors or timeouts.

- **Measurement:** Load testing with gradual ramp-up to 5x baseline requests/sec
- **Target:** No 5xx errors, P95 <1s response time under spike
- **Priority:** Should-have

### 4.3 Security Requirements

**NF-010:** User passwords shall be hashed using bcrypt or Argon2 with minimum 10 rounds (bcrypt) or Argon2id parameters (memory: 64MB, iterations: 3).

- **Measurement:** Code review of auth implementation
- **Target:** 100% of passwords hashed, no plaintext storage
- **Priority:** Must-have

**NF-011:** Session cookies shall be configured with HttpOnly, Secure (in production), and SameSite=Lax flags to prevent XSS and CSRF attacks.

- **Measurement:** Browser DevTools inspection of Set-Cookie headers
- **Target:** All flags present in production
- **Priority:** Must-have

**NF-012:** API mutation routes (POST, PATCH, DELETE) shall include CSRF protection via NextAuth CSRF tokens and same-site cookie enforcement.

- **Measurement:** Attempt CSRF attack with cross-origin request
- **Target:** 403 Forbidden for requests without valid CSRF token
- **Priority:** Must-have

**NF-013:** The system shall implement rate limiting on authentication routes: max 5 failed login attempts per email per 15 minutes, max 3 signup attempts per IP per hour.

- **Measurement:** Automated testing of brute-force attempts
- **Target:** 429 Too Many Requests after threshold exceeded
- **Priority:** Must-have

**NF-014:** All database queries shall enforce user scoping (WHERE userId = :sessionUserId) to prevent unauthorized access to other users' data.

- **Measurement:** Code review + penetration testing
- **Target:** 100% of queries include userId filter, no cross-user data leakage
- **Priority:** Must-have

**NF-015:** File uploads (transaction attachments, if enabled) shall be validated by MIME type (images only: jpeg, png, pdf) and size (max 5MB per file), stored in private S3-compatible bucket with pre-signed URLs for access.

- **Measurement:** Attempt uploads of invalid types/sizes
- **Target:** 400 Bad Request for invalid uploads, no public access to bucket
- **Priority:** Could-have (if attachments implemented)

**NF-016:** The system shall comply with OWASP ASVS Level 1 requirements, including input validation, output encoding, secure session management, and error handling.

- **Measurement:** OWASP ASVS checklist audit
- **Target:** 100% Level 1 requirements met
- **Priority:** Must-have

### 4.4 Privacy and Compliance

**NF-017:** The system shall not transmit user data to third-party analytics or tracking services in V1 (self-hosted analytics optional in future).

- **Measurement:** Network traffic inspection
- **Target:** Zero external requests to analytics providers
- **Priority:** Must-have

**NF-018:** Users shall be able to request complete account deletion via `/settings`, which shall hard-delete all associated data (transactions, categories, accounts, budgets) within 24 hours.

- **Measurement:** Test account deletion flow
- **Target:** All user data removed from DB within 24h, confirmation email sent
- **Priority:** Must-have (GDPR compliance)

**NF-019:** The system shall not store sensitive financial account numbers (e.g., bank account, credit card numbers) in V1.

- **Measurement:** Schema review
- **Target:** No fields for account numbers in database
- **Priority:** Must-have

**NF-020:** The system shall log only non-PII metadata (route, timestamp, status code, duration) for observability; email addresses shall not appear in application logs.

- **Measurement:** Log audit
- **Target:** Zero email addresses or passwords in logs
- **Priority:** Must-have

### 4.5 Accessibility Requirements

**NF-021:** The system shall meet WCAG 2.1 Level AA standards for color contrast, keyboard navigation, and ARIA labels.

- **Measurement:** Axe DevTools audit on key pages (dashboard, transactions, forms)
- **Target:** Zero critical or serious accessibility violations
- **Priority:** Must-have

**NF-022:** All interactive elements (buttons, links, form inputs) shall be keyboard-navigable with visible focus indicators (outline or ring).

- **Measurement:** Manual keyboard navigation test
- **Target:** 100% of interactive elements reachable via Tab, focus visible
- **Priority:** Must-have

**NF-023:** Form errors shall be announced to screen readers via ARIA live regions and associated with inputs via aria-describedby.

- **Measurement:** Screen reader testing (NVDA/JAWS)
- **Target:** All form errors announced and associated correctly
- **Priority:** Must-have

**NF-024:** Charts shall include accessible data tables or text summaries for screen reader users.

- **Measurement:** Screen reader testing on dashboard charts
- **Target:** All chart data accessible via table or summary
- **Priority:** Should-have

### 4.6 Internationalization and Localization

**NF-025:** All user-facing text shall be isolated in language files (e.g., `/locales/en.json`) to enable future translation, though V1 launches with English only.

- **Measurement:** Code review for hardcoded strings
- **Target:** 100% of UI text in locale files
- **Priority:** Should-have

**NF-026:** Currency formatting shall use EUR symbol (€) and European formatting (e.g., 1.234,56 €) via Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).

- **Measurement:** Visual review of all currency displays
- **Target:** Consistent formatting across app
- **Priority:** Must-have

**NF-027:** Date formatting shall use local format (DD.MM.YYYY) via Intl.DateTimeFormat('de-DE').

- **Measurement:** Visual review of date displays
- **Target:** Consistent date formatting
- **Priority:** Must-have

### 4.7 Observability and Monitoring

**NF-028:** The system shall log all API requests with structured JSON format: { timestamp, route, method, userId, statusCode, duration }.

- **Measurement:** Log format inspection
- **Target:** 100% of API routes logged
- **Priority:** Must-have

**NF-029:** The system shall capture unhandled errors with stack traces and log to error tracking service (e.g., Sentry) or file-based logging.

- **Measurement:** Trigger test error, verify capture
- **Target:** 100% of unhandled errors captured
- **Priority:** Must-have

**NF-030:** The system shall provide a health check endpoint (GET /api/health) returning JSON { status: "ok", db: "connected" } with 200 status when healthy, 503 when database unreachable.

- **Measurement:** Hit endpoint, verify response
- **Target:** Accurate health status
- **Priority:** Must-have

---

## 5. User Experience Specifications

### 5.1 Navigation and Layout

**UX-001:** The application shall use a persistent sidebar navigation (desktop) and bottom tab bar (mobile) with links to: Dashboard, Transactions, Categories, Accounts, Settings.

- **Visual:** Sidebar with icons + labels, active state highlighted
- **Mobile:** Bottom tab bar with icons only, active state highlighted

**UX-002:** The "+ Add Transaction" button shall be accessible from all pages via a floating action button (FAB) in the bottom-right corner (mobile) or sticky header button (desktop).

- **Visual:** Circular FAB with "+" icon (mobile), rectangular button with icon + text (desktop)
- **Interaction:** Click opens transaction form drawer/sheet

**UX-003:** The transaction form shall open as a slide-out drawer from the right (desktop, 480px width) and full-screen bottom sheet (mobile).

- **Visual:** Drawer overlays content with backdrop, close on backdrop click or X button
- **Animation:** 300ms ease-in-out slide transition

### 5.2 Forms and Input Patterns

**UX-004:** All form inputs shall use shadcn/ui components with consistent styling: rounded borders, focus rings, clear labels, and inline error messages.

- **Visual:** Label above input, error text in red below input, focus ring in primary color
- **Validation:** Real-time validation on blur, display errors immediately

**UX-005:** The category dropdown shall display categories with color swatches (12px circle) next to names, grouped by type (expense/income) with group headers.

- **Visual:** Combobox with search, colored dots, group headers "Expenses" and "Income"

**UX-006:** The date picker shall default to today's date and provide quick presets (Today, Yesterday, 2 Days Ago).

- **Visual:** Calendar popover with preset buttons at top
- **Interaction:** Click preset sets date and closes picker

**UX-007:** The amount input shall accept decimal values with automatic EUR formatting on blur (e.g., user types "45", displays "€45.00").

- **Visual:** Right-aligned text with € prefix
- **Validation:** Prevent negative values, max 2 decimal places

### 5.3 Data Visualization

**UX-008:** The category donut chart shall use distinct colors per category (from category.color), with legend positioned to the right (desktop) or below (mobile).

- **Visual:** Donut with 60% hole, segments sorted by size clockwise from 12 o'clock
- **Legend:** Category name, amount (€), percentage

**UX-009:** The cash-flow line chart shall use a zero baseline with green area fill for positive months, red for negative.

- **Visual:** Line chart with gradient fill, X-axis (months), Y-axis (EUR with K abbreviation)
- **Interaction:** Hover shows tooltip with exact values

**UX-010:** Empty charts shall display a friendly message "No data for this period" with an illustration and "+ Add Transaction" CTA.

- **Visual:** Centered text with subtle icon, CTA button below

### 5.4 Feedback and States

**UX-011:** All successful mutations (create, update, delete) shall display a toast notification (bottom-center, 3s duration) with success message and undo option (where applicable).

- **Visual:** Green toast with checkmark icon, "Transaction added" + "Undo" link
- **Interaction:** Click "Undo" reverses action, shows "Undone" toast

**UX-012:** All loading states shall display skeleton loaders matching the content layout (shimmering placeholders for text, charts).

- **Visual:** Gray rectangles with shimmer animation
- **Duration:** Shown until data fetch completes

**UX-013:** All confirmation modals shall use shadcn/ui AlertDialog with clear primary action (destructive red for delete actions).

- **Visual:** Modal with title, description, Cancel (secondary) and Confirm (primary) buttons
- **Interaction:** Esc key closes modal, Enter confirms

### 5.5 Responsive Design

**UX-014:** The dashboard shall switch from 3-column KPI layout (desktop) to single-column stack (mobile <768px).

- **Breakpoints:** Desktop ≥1024px (3 columns), Tablet 768-1023px (2 columns), Mobile <768px (1 column)

**UX-015:** The transaction table shall collapse to card layout on mobile, showing Date, Amount, and Category in stacked rows.

- **Visual:** Desktop: table with columns; Mobile: cards with borderline separator

**UX-016:** Charts shall be responsive with aspect ratio maintained, min-height 300px on mobile to ensure readability.

- **Visual:** Charts scale to container width, legend reflows

### 5.6 Keyboard Shortcuts

**UX-017:** The application shall support keyboard shortcuts: `N` for New Transaction, `Ctrl/Cmd+K` for quick-add (opens transaction form), `/` to focus search.

- **Visual:** Shortcuts displayed in tooltips and help panel
- **Interaction:** Shortcuts work globally except when focused in input

---

## 6. Data & Integration Requirements

### 6.1 Data Models

**Data Model Overview:**
The system uses PostgreSQL with Prisma ORM. Core entities: User, Account, Category, Transaction, Budget (stretch).

**ER Diagram:**

```
User ||--o{ Account : owns
User ||--o{ Category : owns
User ||--o{ Transaction : owns
User ||--o{ Budget : owns
Account ||--o{ Transaction : has
Category ||--o{ Transaction : classifies
Category ||--o{ Budget : tracks
```

**Key Constraints:**

- User.email: UNIQUE
- Transaction: FK constraints to User, Account, Category with ON DELETE CASCADE (handled at application layer with reassignment)
- Budget: UNIQUE (userId, categoryId, year, month)

### 6.2 API Specifications

**Base URL:** `/api`

**Authentication:** All endpoints except `/api/auth/*` require valid session cookie. Return 401 if unauthenticated.

**Error Format:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be positive",
    "details": { "field": "amount", "value": -10 }
  }
}
```

**Endpoints:**

**Auth:**

- `POST /api/auth/signup` → `{ email, password, name? }` → `201 { user: { id, email, name } }`
- `POST /api/auth/signin` → `{ email, password }` → `200 { user: { id, email, name } }`
- `POST /api/auth/signout` → `204`

**Transactions:**

- `GET /api/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&accountId=&categoryId=&type=&q=` → `200 { data: Transaction[], total: number }`
- `POST /api/transactions` → `{ amount, type, txnDate, categoryId, accountId, note?, tags? }` → `201 { data: Transaction }`
- `PATCH /api/transactions/:id` → `{ amount?, type?, txnDate?, categoryId?, accountId?, note?, tags? }` → `200 { data: Transaction }`
- `DELETE /api/transactions/:id` → `204`
- `POST /api/transactions/bulk/reassign` → `{ ids: string[], categoryId }` → `200 { updated: number }`

**Categories:**

- `GET /api/categories` → `200 { data: Category[] }`
- `POST /api/categories` → `{ name, color?, type }` → `201 { data: Category }`
- `PATCH /api/categories/:id` → `{ name?, color? }` → `200 { data: Category }`
- `DELETE /api/categories/:id?reassignTo=<id>` → `204`

**Accounts:**

- `GET /api/accounts` → `200 { data: Account[] }`
- `POST /api/accounts` → `{ name, color? }` → `201 { data: Account }`
- `PATCH /api/accounts/:id` → `{ name?, color? }` → `200 { data: Account }`
- `DELETE /api/accounts/:id?reassignTo=<id>` → `204`

**Reports:**

- `GET /api/reports/summary?from=&to=` → `200 { totalIncome, totalExpense, net, transactionCount }`
- `GET /api/reports/by-category?from=&to=&type=expense` → `200 { data: [{ categoryId, categoryName, total, percentage }] }`
- `GET /api/reports/cashflow?start=YYYY-MM&months=6` → `200 { data: [{ month, income, expense, net }] }`

**Budgets (Stretch):**

- `GET /api/budgets?year=&month=` → `200 { data: Budget[] }`
- `POST /api/budgets` → `{ categoryId, year, month, targetAmount }` → `201 { data: Budget }`
- `GET /api/budgets/progress?year=&month=` → `200 { data: [{ categoryId, target, spent, remaining, status }] }`

### 6.3 Third-Party Integrations

**V1:** No third-party integrations (no bank APIs, no external analytics).

**Future (V2+):**

- Plausible/Umami for privacy-respecting analytics (self-hosted)
- S3-compatible storage for transaction attachments (optional)

### 6.4 Data Migration and Seeding

**Seed Data (Development):**

- 1 test user: `test@budgetbuddy.app` / `password123`
- 2 accounts: Cash, Card
- 10 system categories
- 20-30 demo transactions spanning last 2 months

**Production:**

- No demo data
- System categories and default accounts created on user signup (FR-016, FR-026)

**Data Export/Import (Stretch V1.1):**

- Export: CSV format with headers (Date, Type, Amount, Currency, Category, Account, Note, Tags)
- Import: CSV upload with column mapping UI, preview before import

---

## 7. Technical Constraints & Assumptions

### 7.1 Technology Stack

**Frontend:**

- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- shadcn/ui component library
- Recharts for data visualization
- React Hook Form + Zod for form validation

**Backend:**

- Next.js API Route Handlers (coupled architecture)
- NextAuth.js for authentication
- Prisma ORM
- PostgreSQL 14+

**Deployment:**

- Vercel (frontend + serverless functions) OR
- Self-hosted VPS (Docker + Caddy)
- PostgreSQL: Managed service (Supabase/Neon) or self-hosted

### 7.2 Infrastructure Constraints

**Assumption:** Single-region deployment (EU, preferably Germany/Netherlands for GDPR compliance).

**Database:**

- Single PostgreSQL instance (no read replicas in V1)
- Connection pooling via Prisma (max 10 connections)
- Backup: Daily snapshots, 7-day retention

**Compute:**

- Serverless functions (Vercel) OR Docker container (1 CPU, 2GB RAM minimum)
- Auto-scaling not required for V1 (<10k users)

**Storage:**

- Database: 10GB initial allocation (sufficient for ~1M transactions)
- File storage (if attachments enabled): S3-compatible bucket, 100GB limit

### 7.3 Performance Assumptions

**Assumed User Behavior:**

- Average 100 transactions per user per month
- Peak usage: End of month (5x normal traffic)
- Average session duration: 5-8 minutes
- 70% mobile users, 30% desktop

**Assumed Load:**

- 1000 active users at launch
- 100 concurrent users at peak
- 10 requests/sec at baseline, 50 requests/sec at peak

### 7.4 Regulatory and Compliance Constraints

**GDPR Compliance (must-have):**

- Right to access: User can export all data
- Right to deletion: User can delete account and all data
- Data minimization: Only collect email, name (optional), transaction data
- No data sharing with third parties

**Security Standards:**

- OWASP ASVS Level 1
- HTTPS only (HTTP redirects to HTTPS)
- CSP headers to prevent XSS

### 7.5 Assumptions Requiring Validation

**Assumption 1:** Users prefer manual entry over bank integration (validated via user research).

**Assumption 2:** EUR is sufficient for V1 target market (DACH region).

**Assumption 3:** 10-second transaction logging target is achievable with optimized form UX (requires usability testing).

**Assumption 4:** Donut chart is preferred over bar chart for category breakdown (validated via research).

**Assumption 5:** Budgets can wait for V1.1 without hurting adoption (to be validated post-launch).

---

## 8. Success Metrics & Analytics

### 8.1 Key Performance Indicators (KPIs)

| KPI                             | Description                         | Baseline | Target (3 months) | Target (6 months) | Measurement Method            |
| ------------------------------- | ----------------------------------- | -------- | ----------------- | ----------------- | ----------------------------- |
| **User Acquisition**            |
| Total Registered Users          | Cumulative signups                  | 0        | 5,000             | 10,000            | Database count                |
| Weekly Signups                  | New users per week                  | 0        | 300               | 500               | Weekly cohort analysis        |
| Signup Completion Rate          | % who complete signup form          | N/A      | 75%               | 80%               | Funnel tracking               |
| **User Engagement**             |
| Weekly Active Users (WAU)       | Users logging ≥1 transaction/week   | 0%       | 50%               | 70%               | Activity tracking             |
| Avg Transactions per User/Month | Median transactions logged monthly  | 0        | 40                | 60                | Transaction count aggregation |
| Dashboard Views per User/Week   | Avg weekly dashboard visits         | 0        | 3                 | 4                 | Page view tracking            |
| **Retention**                   |
| 7-Day Retention                 | % returning within 7 days           | 0%       | 50%               | 60%               | Cohort retention analysis     |
| 30-Day Retention                | % returning within 30 days          | 0%       | 40%               | 60%               | Cohort retention analysis     |
| Churn Rate                      | % inactive >30 days                 | N/A      | <50%              | <40%              | Inactivity tracking           |
| **Feature Adoption**            |
| Custom Category Creation        | % users creating ≥1 custom category | 0%       | 40%               | 50%               | Feature usage tracking        |
| Chart Interaction               | % users clicking chart elements     | 0%       | 30%               | 40%               | Event tracking                |
| CSV Export Usage (Stretch)      | % users exporting data              | N/A      | 10%               | 15%               | Event tracking                |
| **Performance**                 |
| Avg Transaction Log Time        | Time from click to saved            | N/A      | <10s              | <8s               | Client-side timing            |
| Dashboard Load Time (TTI)       | Time to interactive                 | N/A      | <2s               | <1.5s             | Lighthouse/RUM                |
| API P95 Response Time           | 95th percentile API latency         | N/A      | <300ms            | <250ms            | Server logs                   |

### 8.2 User Behavior Tracking Requirements

**Events to Track (if analytics enabled):**

1. `user_signup` - When user completes registration
2. `user_login` - When user logs in
3. `transaction_created` - When transaction is saved
4. `transaction_edited` - When transaction is updated
5. `transaction_deleted` - When transaction is deleted
6. `category_created` - When custom category is created
7. `account_created` - When custom account is created
8. `chart_interaction` - When user clicks chart element
9. `csv_export` - When user exports data
10. `filter_applied` - When user applies date/category/account filter

**Properties to Capture:**

- `userId` (hashed)
- `timestamp`
- `event_name`
- `properties` (e.g., `category_type`, `transaction_amount_range`)

**Privacy:** No PII in events (email, amounts should be generalized).

### 8.3 Business Metrics and Reporting

**Monthly Business Review Metrics:**

1. **Growth:** New users, total users, growth rate (%)
2. **Engagement:** WAU, avg transactions/user, avg session duration
3. **Retention:** 7-day, 30-day retention by cohort
4. **Performance:** P95 API latency, uptime %, error rate
5. **Support:** Support tickets, avg resolution time

**Dashboard Requirements:**

- Admin dashboard (future) showing above metrics in real-time
- Weekly email report to stakeholders with key KPIs

### 8.4 A/B Testing and Experimentation Plans

**Potential Tests (Post-Launch):**

1. **Transaction Form Layout:** Drawer vs. Modal vs. Inline
2. **Category Selector:** Dropdown vs. Grid of colored buttons
3. **Empty State CTA:** "Add Transaction" vs. "Log First Expense"
4. **Dashboard Filter Default:** "This Month" vs. "Last 30 Days"

**Testing Framework:** Feature flags (environment variables) + manual traffic split initially; evolve to A/B platform later.

---

## 9. Launch & Rollout Strategy

### 9.1 Phased Rollout Plan

**Phase 1: Private Alpha (Weeks 1-2)**

- **Audience:** 10-15 internal testers + close friends
- **Goals:** Identify critical bugs, validate core user flows
- **Success Criteria:** Zero P0 bugs, 80% testers log ≥5 transactions

**Phase 2: Closed Beta (Weeks 3-6)**

- **Audience:** 100 invited users (user research participants, early adopters)
- **Goals:** Gather feedback on UX, identify edge cases, validate performance
- **Success Criteria:** 60% 7-day retention, <5% error rate, positive qualitative feedback

**Phase 3: Public Beta (Weeks 7-10)**

- **Audience:** Open signups with waitlist (target 1000 users)
- **Goals:** Stress test infrastructure, validate scalability, build community
- **Success Criteria:** 99% uptime, <300ms P95 API latency, 50% WAU

**Phase 4: General Availability (Week 12)**

- **Audience:** Public launch with marketing push
- **Goals:** Drive user acquisition, establish product-market fit
- **Success Criteria:** 5000 users within 3 months, 60% 30-day retention

### 9.2 Beta Testing and User Feedback Collection

**Feedback Channels:**

1. **In-App Feedback Widget:** Accessible from all pages, submits to issue tracker
2. **User Interviews:** Weekly sessions with 3-5 beta users
3. **Survey:** Post-onboarding survey (NPS, feature satisfaction)
4. **Discord Community:** For beta users to discuss, report bugs

**Feedback Review Cadence:**

- Daily: Critical bugs triaged
- Weekly: Feedback synthesis, prioritization
- Bi-weekly: Product roadmap adjustments

### 9.3 Feature Flags and Gradual Release

**Feature Flags (Environment Variables):**

- `ENABLE_BUDGETS` - Toggle budgets feature (default: false in V1)
- `ENABLE_RECURRING` - Toggle recurring transactions (default: false in V1)
- `ENABLE_CSV_EXPORT` - Toggle CSV export (default: false in V1, true in V1.1)
- `ENABLE_ATTACHMENTS` - Toggle transaction attachments (default: false)

**Gradual Release Strategy:**

- Core features (transactions, categories, accounts, dashboard) available to all users
- Stretch features (budgets, export) enabled for beta cohort first, then GA

### 9.4 Training and Documentation

**User Documentation:**

1. **Onboarding Guide:** Interactive walkthrough on first login (add first transaction, view dashboard)
2. **Help Center:** FAQ, how-to articles (hosted on `/help`)
3. **Video Tutorials:** 2-3 min screencasts for key workflows (YouTube)

**Developer Documentation:**

1. **README:** Setup instructions, architecture overview
2. **API Docs:** OpenAPI spec for route handlers (future)
3. **Contributing Guide:** For open-source contributors (if OSS)

### 9.5 Success Criteria for Each Launch Phase

| Phase                    | Success Criteria                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Private Alpha**        | - All core flows functional<br>- Zero P0 bugs<br>- 80% testers complete onboarding                     |
| **Closed Beta**          | - 60% 7-day retention<br>- P95 API latency <300ms<br>- Positive qualitative feedback (≥4/5 avg rating) |
| **Public Beta**          | - 99% uptime<br>- 1000 users<br>- 50% WAU<br>- <2% error rate                                          |
| **General Availability** | - 5000 users within 3 months<br>- 60% 30-day retention<br>- <10s avg transaction log time              |

---

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

| Risk                                 | Likelihood | Impact | Mitigation Strategy                                                                                                               |
| ------------------------------------ | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Database Performance Degradation** | Medium     | High   | - Implement proper indexing (userId, txnDate)<br>- Load test with 1M transactions<br>- Set up query monitoring                    |
| **NextAuth Security Vulnerability**  | Low        | High   | - Use latest stable version<br>- Enable all security flags (HttpOnly, Secure, SameSite)<br>- Regular dependency audits            |
| **Serverless Cold Start Latency**    | Medium     | Medium | - Use Vercel Edge Functions where possible<br>- Implement optimistic UI updates<br>- Consider dedicated server if >5s cold starts |
| **Prisma Migration Conflicts**       | Low        | Medium | - Use migration snapshots<br>- Test migrations in staging<br>- Implement rollback procedures                                      |

### 10.2 Business Risks

| Risk                                        | Likelihood | Impact | Mitigation Strategy                                                                                                                  |
| ------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Low User Adoption**                       | Medium     | High   | - Validate with user research before launch<br>- Focus on clear value prop (privacy, simplicity)<br>- Iterate based on beta feedback |
| **High Churn Due to Complexity**            | Medium     | High   | - Conduct usability testing<br>- Simplify onboarding<br>- Provide in-app guidance                                                    |
| **Competitive Pressure (Established Apps)** | High       | Medium | - Emphasize differentiation (privacy-first, simplicity)<br>- Focus on underserved EU market<br>- Build community                     |
| **GDPR Compliance Issues**                  | Low        | High   | - Legal review of data handling<br>- Implement full data deletion<br>- Host in EU region                                             |

### 10.3 Market Risks

| Risk                                  | Likelihood | Impact | Mitigation Strategy                                                                                            |
| ------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| **Market Saturation (Finance Apps)**  | High       | Medium | - Target niche (privacy-conscious, manual trackers)<br>- Differentiate on simplicity<br>- Build referral loops |
| **Regulatory Changes (EU Data Laws)** | Low        | Medium | - Stay updated on regulations<br>- Design for compliance from start<br>- Legal consultation                    |
| **Economic Downturn Reducing Demand** | Medium     | Low    | - Position as cost-saving tool<br>- Emphasize free tier<br>- Focus on value during budget constraints          |

### 10.4 Resource and Timeline Risks

| Risk                            | Likelihood | Impact | Mitigation Strategy                                                                                                  |
| ------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| **Scope Creep Delaying Launch** | High       | High   | - Strict MVP scope (no budgets/recurring in V1)<br>- Weekly sprint reviews<br>- Feature freeze 2 weeks before launch |
| **Key Team Member Departure**   | Low        | High   | - Documentation of all systems<br>- Pair programming<br>- Knowledge sharing sessions                                 |
| **Underestimated Testing Time** | Medium     | Medium | - Allocate 2 weeks for testing (Milestone 5)<br>- Automated E2E tests from start<br>- Buffer time in timeline        |

### 10.5 Dependencies on External Factors

**Dependency: PostgreSQL Managed Service Availability**

- **Risk:** Service outage impacts all users
- **Mitigation:** Daily backups, disaster recovery plan, ability to migrate to self-hosted

**Dependency: Vercel Platform Stability**

- **Risk:** Platform issues delay deployment
- **Mitigation:** Alternative deployment path (Docker + VPS) documented

**Dependency: shadcn/ui Component Updates**

- **Risk:** Breaking changes in component library
- **Mitigation:** Pin versions, test updates in staging

---

## 11. Appendices

### 11.1 Glossary of Terms

| Term                | Definition                                                                         |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Account**         | A user-defined wallet (e.g., Cash, Card) tracking transaction sources              |
| **Category**        | Classification of transaction (e.g., Groceries, Salary) with type (expense/income) |
| **Transaction**     | Individual income or expense entry with amount, date, category, account            |
| **Budget**          | Monthly spending target for a category (stretch feature)                           |
| **System Category** | Default categories (Groceries, Dining, etc.) that cannot be deleted                |
| **Cash-Flow**       | Income minus expense for a period                                                  |
| **Net**             | Cash-flow (used interchangeably)                                                   |
| **KPI**             | Key Performance Indicator (metric tracking success)                                |
| **WAU**             | Weekly Active Users (users logging ≥1 transaction per week)                        |
| **TTI**             | Time to Interactive (performance metric)                                           |
| **P95**             | 95th percentile (95% of requests complete within this time)                        |

### 11.2 References to Supporting Documents

1. **User Research Report:** `/docs/research/user-interviews-2025-10.pdf`
2. **Competitive Analysis:** `/docs/research/competitive-analysis.xlsx`
3. **Design Mockups:** Figma link (to be added)
4. **Technical Architecture (SAS):** `/docs/architecture/SAS.md` (to be created)
5. **Test Plan:** `/docs/testing/test-plan.md` (to be created)
6. **OWASP ASVS Checklist:** https://owasp.org/www-project-application-security-verification-standard/

### 11.3 Traceability Matrix

Links business objectives to specific functional requirements:

| Business Objective                          | Related Functional Requirements            |
| ------------------------------------------- | ------------------------------------------ |
| **Enable quick transaction logging (<10s)** | FR-007, FR-008, UX-002, UX-003, NF-003     |
| **Provide spending visibility**             | FR-040, FR-041, FR-042, FR-044             |
| **Support category customization**          | FR-018, FR-019, FR-021, US-004             |
| **Ensure privacy**                          | NF-017, NF-018, NF-019, NF-020             |
| **Achieve 60% 30-day retention**            | All UX requirements, FR-046 (empty states) |
| **Maintain 99% uptime**                     | NF-007, NF-030 (health checks)             |

### 11.4 Detailed User Research Findings

**Sample Interview Quotes:**

_Aida (Budget Beginner):_

> "I tried Mint, but I didn't trust giving it my bank password. I just want to see where my money goes, not link everything."

_Marko (Side-Hustler):_

> "I need something I can pull out between meetings. If it takes more than 10 seconds to log an expense, I forget."

_Lejla (Health-Conscious Spender):_

> "I want to separate groceries from restaurants. The defaults in other apps don't match how I think about my budget."

### 11.5 Technical Diagrams

**System Architecture (High-Level):**

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ HTTPS
┌────────▼────────────────────────┐
│   Next.js App (Vercel/VPS)      │
│  ┌──────────────────────────┐   │
│  │  App Router (RSC)        │   │
│  │  - Pages (/dashboard)    │   │
│  │  - API Routes (/api/*)   │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  NextAuth (Session)      │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  Prisma ORM              │   │
│  └──────────┬───────────────┘   │
└─────────────┼───────────────────┘
              │
┌─────────────▼───────────────┐
│   PostgreSQL (Managed)      │
│   - Users, Transactions,    │
│     Categories, Accounts    │
└─────────────────────────────┘
```

**Data Flow: Create Transaction**

```
1. User submits form → Client validation (Zod)
2. POST /api/transactions → Server Action / Route Handler
3. Validate session (NextAuth) → Extract userId
4. Validate data (Zod) → Check category/account ownership
5. Prisma insert → Database write
6. Return 201 + Transaction → Client updates UI
7. Toast notification → User confirmation
```

---

## 12. Change Log

| Version | Date       | Author           | Changes                                                      |
| ------- | ---------- | ---------------- | ------------------------------------------------------------ |
| 0.1     | 2025-10-15 | Product Team     | Initial draft based on requirements doc                      |
| 0.2     | 2025-10-18 | Product Team     | Added user research findings, refined FR acceptance criteria |
| 0.3     | 2025-10-20 | Engineering Lead | Technical constraints and API specs added                    |
| 1.0     | 2025-10-24 | Product Team     | Final review, stakeholder approval                           |

---

## 13. Approval Signatures

| Stakeholder | Role             | Approval     | Date |
| ----------- | ---------------- | ------------ | ---- |
| [Name]      | Product Manager  | [ ] Approved |      |
| [Name]      | Engineering Lead | [ ] Approved |      |
| [Name]      | Design Lead      | [ ] Approved |      |
| [Name]      | QA Lead          | [ ] Approved |      |
| [Name]      | Business Owner   | [ ] Approved |      |

---

**End of Product Requirements Document**

**Next Steps:**

1. Create Software Architecture Specification (SAS) document
2. Break down functional requirements into development tasks
3. Set up project repository and development environment
4. Begin Milestone 1 (Foundations)
