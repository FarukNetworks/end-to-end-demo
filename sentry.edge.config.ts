/**
 * Sentry edge runtime configuration
 * Tracks errors in edge functions and middleware
 */
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),

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
  });
}
