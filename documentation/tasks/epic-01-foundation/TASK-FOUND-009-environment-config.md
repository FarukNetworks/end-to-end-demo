# TASK-FOUND-009 - Configure Environment Variables and Deployment

## Context & Goal

**Business Value:** Secure configuration management for different environments (dev, staging, production)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 12 (Security), NF-010 to NF-016 (Security requirements)

## Scope Definition

**✅ In Scope:**

- .env.example file with all required variables
- Environment variable validation
- Development, staging, production configurations
- Secure secrets management
- Deployment configuration (Vercel or Docker)
- Environment-specific feature flags

**⛔ Out of Scope:**

- Secrets rotation (DevOps process)
- Multi-region deployment (V2)
- Advanced feature flag system (LaunchDarkly, etc.) - V2

## Technical Specifications

**Implementation Details:**

- Create `.env.example`:

  ```bash
  # Database
  DATABASE_URL=postgresql://user:password@localhost:5432/budgetbuddy

  # NextAuth
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

  # Feature Flags (V1)
  ENABLE_BUDGETS=false
  ENABLE_RECURRING=false
  ENABLE_CSV_EXPORT=false
  ENABLE_ATTACHMENTS=false

  # Environment
  NODE_ENV=development

  # Optional: Error Tracking
  # SENTRY_DSN=
  # SENTRY_ENV=development
  ```

- Create environment validation in `/lib/env.ts`:

  ```typescript
  import { z } from 'zod';

  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    ENABLE_BUDGETS: z
      .string()
      .transform(val => val === 'true')
      .default('false'),
    ENABLE_CSV_EXPORT: z
      .string()
      .transform(val => val === 'true')
      .default('false'),
  });

  export const env = envSchema.parse(process.env);
  ```

- Create feature flags helper in `/lib/features.ts`:

  ```typescript
  import { env } from '@/lib/env';

  export const features = {
    budgets: env.ENABLE_BUDGETS,
    csvExport: env.ENABLE_CSV_EXPORT,
    recurring: false, // Not implemented in V1
    attachments: false, // Not implemented in V1
  } as const;

  export function isFeatureEnabled(feature: keyof typeof features): boolean {
    return features[feature];
  }
  ```

- Create Vercel configuration `vercel.json`:

  ```json
  {
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "regions": ["fra1"],
    "env": {
      "DATABASE_URL": "@database-url",
      "NEXTAUTH_SECRET": "@nextauth-secret",
      "NEXTAUTH_URL": "@nextauth-url"
    }
  }
  ```

- OR create Docker configuration `Dockerfile`:

  ```dockerfile
  FROM node:18-alpine AS base

  # Dependencies
  FROM base AS deps
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci

  # Builder
  FROM base AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npx prisma generate
  RUN npm run build

  # Runner
  FROM base AS runner
  WORKDIR /app
  ENV NODE_ENV production

  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs

  COPY --from=builder /app/public ./public
  COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
  COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

  USER nextjs
  EXPOSE 3000
  ENV PORT 3000

  CMD ["node", "server.js"]
  ```

**Architecture References:**

- Next.js Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- Vercel Deployments: https://vercel.com/docs

## Acceptance Criteria

1. **Given** .env.example file
   **When** copying to .env.local and filling values
   **Then** application starts without missing variable errors

2. **Given** missing required environment variable
   **When** application starts
   **Then** env validation throws error with specific variable name

3. **Given** ENABLE_BUDGETS=true
   **When** checking isFeatureEnabled('budgets')
   **Then** returns true

4. **Given** production deployment
   **When** checking environment
   **Then** NODE_ENV=production and secure flags enabled

5. **Given** staging environment
   **When** deployed
   **Then** uses staging database and NEXTAUTH_URL

## Definition of Done

- [ ] .env.example created with all required variables
- [ ] Environment validation schema (Zod) implemented
- [ ] Feature flags configuration created
- [ ] Deployment configuration (Vercel or Docker) created
- [ ] Environment-specific configs (dev, staging, prod)
- [ ] Secrets documented (how to generate NEXTAUTH_SECRET)
- [ ] README updated with environment setup instructions
- [ ] All environments tested (dev, staging, prod)
- [ ] No secrets committed to repository (.gitignore verified)

## Dependencies

**Upstream Tasks:** TASK-FOUND-001 (Project structure)  
**External Dependencies:** Hosting platform (Vercel or VPS)  
**Parallel Tasks:** TASK-FOUND-008 (CI/CD uses env vars)  
**Downstream Impact:** All features use environment configuration

## Resources & References

**Design Assets:** N/A (configuration)  
**Technical Docs:**

- Next.js Env Vars: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

**PRD References:** Section 12 (Security), Section 14 (Feature flags)  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- .env.example creation: 1 hour
- Environment validation: 1.5 hours
- Deployment config: 1.5 hours
- Testing: 1-2 hours

**Priority:** P0 (Must-have - deployment prerequisite)  
**Risk Level:** Medium (security-sensitive)

## Assignment

**Primary Owner:** TBD (DevOps Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** N/A (configuration)  
**Stakeholder:** Engineering Lead
