# BudgetBuddy

A privacy-first personal finance tracker built with Next.js, TypeScript, and Tailwind CSS.

## Overview

BudgetBuddy helps individuals log income/expenses, categorize them, and visualize spending trends over time. It's designed to be lightweight, privacy-respecting, and simple to use.

**Key Features:**

- Quick transaction logging (< 10 seconds)
- Category-based spending visualization
- Multiple account tracking (cash, cards)
- Monthly cash-flow reporting
- Privacy-first (no bank integration required)

## Prerequisites

- **Node.js 18+** (LTS version recommended)
- **npm** or **pnpm** or **yarn**
- **PostgreSQL 14+** (for database)

## Getting Started

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your local settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following required variables:

#### Required Variables

| Variable          | Description                                  | Example                                                     |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                 | `postgresql://postgres:postgres@localhost:5432/budgetbuddy` |
| `NEXTAUTH_URL`    | Base URL of your application                 | `http://localhost:3000`                                     |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption (min 32 chars) | Generate with `openssl rand -base64 32`                     |
| `NODE_ENV`        | Environment mode                             | `development`, `production`, or `test`                      |

#### Feature Flags (Optional)

Set to `true` to enable features:

| Flag                 | Description                    | Default |
| -------------------- | ------------------------------ | ------- |
| `ENABLE_BUDGETS`     | Budget tracking and management | `false` |
| `ENABLE_CSV_EXPORT`  | Export transactions to CSV     | `false` |
| `ENABLE_RECURRING`   | Recurring transactions (V2)    | `false` |
| `ENABLE_ATTACHMENTS` | Upload receipts/invoices (V2)  | `false` |

#### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in your `.env.local` file.

### 3. Database Setup

```bash
# This will be available after TASK-FOUND-003 (Database Setup)
# npx prisma migrate dev
# npx prisma db seed
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script                 | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm start`            | Start production server      |
| `npm run lint`         | Run ESLint                   |
| `npm run lint:fix`     | Auto-fix ESLint issues       |
| `npm run format`       | Format code with Prettier    |
| `npm run format:check` | Check code formatting        |
| `npm run type-check`   | Run TypeScript type checking |

## Technology Stack

### Frontend

- **Next.js 15+** (App Router)
- **React 18+**
- **TypeScript 5+**
- **Tailwind CSS 3+**
- **shadcn/ui** (to be added in TASK-FOUND-002)
- **Recharts** (to be added in TASK-FOUND-006)

### Backend

- **Next.js API Routes** (coupled architecture)
- **NextAuth.js** (to be configured in TASK-FOUND-004)
- **Prisma ORM** (to be configured in TASK-FOUND-003)
- **PostgreSQL 14+**

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety

## Project Structure

```
/app
  /api/              - API route handlers
  /login/            - Login page
  /signup/           - Signup page
  /page.tsx          - Dashboard (home page)
  /layout.tsx        - Root layout
  /globals.css       - Global styles
/components/         - Shared UI components
/lib/                - Utilities, validators, db client
/prisma/             - Database schema and migrations
/tests/              - Test files
/documentation/      - Project documentation and task tracking
```

## Development Workflow

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Run linting and type checking**: `npm run lint && npm run type-check`
4. **Format your code**: `npm run format`
5. **Test your changes** (tests to be added in EPIC-10)
6. **Commit using Conventional Commits**: `feat:`, `fix:`, `chore:`, etc.
7. **Push and create a pull request**

## Coding Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Prettier with 100 character line width, single quotes
- **Imports**: Use path aliases (`@/*`) for cleaner imports
- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes
- **Naming**: Domain-first naming (Transaction, Category, Account, Budget)

## Design Tokens

### Spacing Scale

4px/8px system: `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`

### Border Radius

- Default: `rounded-2xl` (32px)
- Options: `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-3xl`

### Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1023px` (md)
- Desktop: `≥ 1024px` (lg)

## Documentation

- **PRD**: [Product Requirements Document](./documentation/PRD.md)
- **Requirements**: [Technical Requirements](./documentation/requirements.md)
- **Tasks**: [Task Breakdown](./documentation/tasks/)

## Milestones

### Milestone 1: Foundations (Current)

- ✅ TASK-FOUND-001: Next.js Setup
- ⏳ TASK-FOUND-002: shadcn/ui Setup
- ⏳ TASK-FOUND-003: Database Setup
- ⏳ TASK-FOUND-004: NextAuth Configuration
- ⏳ TASK-FOUND-005: Form Validation Setup
- ⏳ TASK-FOUND-006: Recharts Setup

### Milestone 2: Transactions

- Transaction CRUD operations
- Bulk actions
- Form validation

### Milestone 3: Categories & Accounts

- Category management
- Account management
- System defaults

### Milestone 4: Reporting & Charts

- Dashboard with KPIs
- Category breakdown chart
- Cash-flow chart

### Milestone 5: Polish & Testing

- Accessibility improvements
- E2E tests
- Performance optimization

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel:

1. **Install Vercel CLI** (optional, for local testing):

   ```bash
   npm i -g vercel
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add the following secrets:
     - `database-url`: Your production PostgreSQL connection string
     - `nextauth-secret`: Generate with `openssl rand -base64 32`
     - `nextauth-url`: Your production URL (e.g., `https://budgetbuddy.vercel.app`)

3. **Deploy**:
   ```bash
   vercel --prod
   ```

The `vercel.json` configuration file handles build settings and environment variable mappings automatically.

### Environment-Specific Configuration

The app supports three environments:

- **Development** (`NODE_ENV=development`): Local development with hot reload
- **Test** (`NODE_ENV=test`): Automated testing environment
- **Production** (`NODE_ENV=production`): Optimized production build

Feature flags can be configured per environment to gradually roll out new features.

## Troubleshooting

### Environment Variable Errors

**Error: "NEXTAUTH_SECRET must be at least 32 characters long"**

- Generate a new secret: `openssl rand -base64 32`
- Ensure no extra whitespace in `.env.local`

**Error: "DATABASE_URL must be a valid URL"**

- Check format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- Ensure no missing parts (user, password, host, port, database name)

**Error: "Cannot find module '@/lib/env'"**

- Restart your development server: `npm run dev`
- Clear Next.js cache: `rm -rf .next`

## Contributing

This is a learning/demo project. Follow the task list in `/documentation/tasks/` for guided implementation.

## License

MIT

## Support

For questions or issues, refer to the task documentation in `/documentation/tasks/`.
