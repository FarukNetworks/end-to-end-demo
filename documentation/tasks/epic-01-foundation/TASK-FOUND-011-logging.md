# TASK-FOUND-011 - Implement Structured Logging and Error Tracking

## Context & Goal

**Business Value:** Enable observability and debugging through structured logs and error tracking (NF-028, NF-029, NF-030)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 13 (Observability), NF-028 to NF-030

## Scope Definition

**✅ In Scope:**

- Structured JSON logging for API requests
- Error tracking integration (file-based or Sentry)
- Request logging middleware
- Health check endpoint
- Log format standardization
- PII filtering from logs

**⛔ Out of Scope:**

- Advanced APM (Application Performance Monitoring) - V2
- Log aggregation service (ELK, Datadog) - Production setup
- Real-time alerting - V2

## Technical Specifications

**Implementation Details:**

- Create logging utility in `/lib/logger.ts`:

  ```typescript
  type LogLevel = 'info' | 'warn' | 'error' | 'debug';

  interface LogData {
    level: LogLevel;
    timestamp: string;
    message: string;
    route?: string;
    method?: string;
    userId?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: any;
  }

  function formatLog(data: LogData): string {
    return JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  export const logger = {
    info: (message: string, meta?: Record<string, any>) => {
      console.log(formatLog({ level: 'info', message, ...meta }));
    },

    warn: (message: string, meta?: Record<string, any>) => {
      console.warn(formatLog({ level: 'warn', message, ...meta }));
    },

    error: (message: string, error?: Error, meta?: Record<string, any>) => {
      console.error(
        formatLog({
          level: 'error',
          message,
          error: error?.message,
          stack: error?.stack,
          ...meta,
        })
      );
    },

    debug: (message: string, meta?: Record<string, any>) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(formatLog({ level: 'debug', message, ...meta }));
      }
    },

    apiRequest: (data: {
      method: string;
      route: string;
      userId?: string;
      statusCode: number;
      duration: number;
    }) => {
      // Filter out PII - never log email or sensitive data
      const safeData = {
        ...data,
        userId: data.userId ? `user_${data.userId.slice(0, 8)}` : undefined,
      };
      console.log(
        formatLog({ level: 'info', message: 'API Request', ...safeData })
      );
    },
  };
  ```

- Create API logging middleware in `/lib/middleware/api-logger.ts`:

  ```typescript
  import { NextResponse } from 'next/server';
  import { logger } from '@/lib/logger';

  export async function withLogging(
    handler: (req: Request) => Promise<NextResponse>,
    req: Request
  ) {
    const start = Date.now();
    const url = new URL(req.url);

    try {
      const response = await handler(req);
      const duration = Date.now() - start;

      logger.apiRequest({
        method: req.method,
        route: url.pathname,
        statusCode: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      logger.error('API Error', error as Error, {
        method: req.method,
        route: url.pathname,
        duration,
      });

      throw error;
    }
  }
  ```

- Create health check endpoint in `/app/api/health/route.ts`:

  ```typescript
  import { NextResponse } from 'next/server';
  import { db } from '@/lib/db';

  export async function GET() {
    try {
      // Check database connectivity
      await db.$queryRaw`SELECT 1`;

      return NextResponse.json({
        status: 'ok',
        db: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return NextResponse.json(
        {
          status: 'error',
          db: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  }
  ```

- Optional: Sentry integration in `/lib/sentry.ts`:

  ```typescript
  import * as Sentry from '@sentry/nextjs';

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        // Filter PII from error events
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });
  }
  ```

**Architecture References:**

- PRD NF-028: Structured logging requirements
- PRD NF-029: Error tracking
- PRD NF-030: Health check endpoint

## Acceptance Criteria

1. **Given** API request made
   **When** request completes
   **Then** structured JSON log with route, method, status, duration

2. **Given** error thrown in API handler
   **When** error occurs
   **Then** error logged with stack trace and request context

3. **Given** GET /api/health with healthy database
   **When** request made
   **Then** return 200 with { status: "ok", db: "connected" }

4. **Given** database connection fails
   **When** GET /api/health
   **Then** return 503 with { status: "error", db: "disconnected" }

5. **Given** logs contain user data
   **When** inspecting log output
   **Then** no email addresses or passwords present (only hashed user IDs)

## Definition of Done

- [ ] logger utility created with info/warn/error/debug methods
- [ ] API request logging middleware implemented
- [ ] Health check endpoint created
- [ ] PII filtering in logs verified
- [ ] Error tracking configured (Sentry or file-based)
- [ ] Log format is valid JSON
- [ ] Health check returns correct status
- [ ] No sensitive data in logs (audit completed)
- [ ] Documentation updated with logging conventions

## Dependencies

**Upstream Tasks:** TASK-FOUND-001 (Project setup)  
**External Dependencies:** Optional - @sentry/nextjs  
**Parallel Tasks:** All foundation tasks  
**Downstream Impact:** All API endpoints use logging

## Resources & References

**Design Assets:** N/A (logging infrastructure)  
**Technical Docs:**

- Sentry: https://docs.sentry.io/platforms/javascript/guides/nextjs/

**PRD References:** NF-028, NF-029, NF-030, NF-020 (No PII in logs)  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 2 story points (3-4 hours)

- Logger utility: 1.5 hours
- API middleware: 1 hour
- Health check: 0.5 hours
- Testing: 1 hour

**Priority:** P0 (Must-have - observability)  
**Risk Level:** Low (logging infrastructure)

## Assignment

**Primary Owner:** TBD (Backend Engineer)  
**Code Reviewer:** TBD (Engineering Lead)  
**QA Owner:** TBD (Log audit)  
**Stakeholder:** Engineering Lead
