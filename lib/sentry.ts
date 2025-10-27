/**
 * Sentry initialization utility
 * Centralized configuration for error tracking with PII filtering
 */
import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/env';

/**
 * Initialize Sentry with environment-based configuration
 * Only initializes if SENTRY_DSN is provided
 */
export function initSentry() {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENV || env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE || 1.0,

    // Filter PII from error events
    beforeSend(event) {
      // Remove sensitive request data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      // Filter user data - keep only ID
      if (event.user) {
        const userId = event.user.id;
        event.user = {
          id: userId,
        };
      }

      return event;
    },

    // Additional options
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  });
}
