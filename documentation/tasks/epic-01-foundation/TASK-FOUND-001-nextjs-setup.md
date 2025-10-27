# TASK-FOUND-001 - Initialize Next.js Project with TypeScript and Tailwind

## Context & Goal

**Business Value:** Establish core application framework to enable all feature development (M1 Foundation)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 9 (Coupled Next.js Project Structure)

## Scope Definition

**✅ In Scope:**

- Next.js 14+ project initialization with App Router
- TypeScript configuration with strict mode
- Tailwind CSS setup with custom design tokens
- ESLint and Prettier configuration
- Project folder structure per PRD Section 9
- Basic routing structure (`/`, `/login`, `/signup`)
- Environment variable configuration (.env.local, .env.example)

**⛔ Out of Scope:**

- shadcn/ui installation (separate task TASK-FOUND-002)
- Database setup (separate task TASK-FOUND-003)
- Authentication configuration (EPIC-02)
- Component implementation (feature epics)

## Technical Specifications

**Implementation Details:**

- Use `npx create-next-app@latest` with TypeScript, Tailwind, App Router
- Configure `tsconfig.json` with strict mode and path aliases (@/\*)
- Set up Tailwind with custom theme (4/8px spacing scale, rounded-2xl)
- Configure ESLint with Next.js recommended + TypeScript rules
- Create folder structure:
  ```
  /app
    /(public)/ - Public routes (dashboard, login, signup)
    /api/ - API route handlers
    /components/ - Shared UI components
    /lib/ - Utilities, validators, db client
  /prisma/ - Schema and migrations
  /tests/ - Test files
  ```

**Architecture References:**

- PRD Section 9: Coupled Next.js Project Structure
- Next.js 14 App Router documentation
- Tailwind CSS 3.x configuration

## Acceptance Criteria

1. **Given** development environment with Node.js 18+
   **When** running `npm run dev`
   **Then** Next.js dev server starts on http://localhost:3000

2. **Given** TypeScript configuration
   **When** importing modules with @/\* alias
   **Then** TypeScript resolves paths correctly without errors

3. **Given** Tailwind CSS setup
   **When** using Tailwind classes in components
   **Then** styles apply correctly with custom theme tokens

4. **Given** ESLint configuration
   **When** running `npm run lint`
   **Then** linting completes with zero configuration errors

5. **Given** project structure
   **When** reviewing folder organization
   **Then** all required folders exist per PRD Section 9

## Definition of Done

- [ ] Next.js 14+ project initialized with App Router
- [ ] TypeScript strict mode enabled and configured
- [ ] Tailwind CSS installed with custom design tokens
- [ ] ESLint and Prettier configured and passing
- [ ] Folder structure matches PRD Section 9
- [ ] .env.example file created with required variables
- [ ] README.md updated with setup instructions
- [ ] Dev server runs without errors
- [ ] Git repository initialized with .gitignore
- [ ] First commit pushed to repository

## Dependencies

**Upstream Tasks:** None (first task)  
**External Dependencies:** Node.js 18+, npm/pnpm, Git  
**Parallel Tasks:** None  
**Downstream Impact:** All other tasks depend on this foundation

## Resources & References

**Design Assets:** N/A (framework setup)  
**Technical Docs:**

- Next.js App Router: https://nextjs.org/docs/app
- Tailwind CSS: https://tailwindcss.com/docs
  **PRD References:** Section 9, Section 18 (Vibe Code Guardrails)  
  **SAS References:** TBD (SAS to be created)

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- Next.js init: 1 hour
- TypeScript + linting config: 1 hour
- Tailwind custom theme: 1-2 hours
- Folder structure + documentation: 1-2 hours

**Priority:** P0 (Must-have - blocks all feature development)  
**Risk Level:** Low (standard setup process)

## Assignment

**Primary Owner:** TBD (Full-stack Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** N/A (setup task)  
**Stakeholder:** Engineering Lead
