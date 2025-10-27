import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Global middleware combining authentication protection and request logging
 * - Protects all routes except public pages (/, /login, /signup) and auth endpoints
 * - Logs all API requests with method, route, status, and duration
 */
export default withAuth(
  async function middleware(request: NextRequest) {
    const start = Date.now();
    const { pathname } = request.nextUrl;
    const method = request.method;

    try {
      // Continue with the request
      const response = NextResponse.next();

      // Calculate duration
      const duration = Date.now() - start;

      // Log the request
      logger.apiRequest({
        method,
        route: pathname,
        statusCode: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      // Log the error
      logger.error('API Error', error as Error, {
        method,
        route: pathname,
        duration,
      });

      // Re-throw to let Next.js handle the error
      throw error;
    }
  },
  {
    callbacks: {
      authorized({ token }) {
        // Return true if token exists (user is authenticated)
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

/**
 * Configure which routes the middleware runs on
 * Protect all routes except:
 * - Public pages: /, /login, /signup
 * - NextAuth endpoints: /api/auth/*
 * - Static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - / (home page - public landing)
     * - /login, /signup (auth pages)
     * - /api/auth/* (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$)(?!$|login$|signup$).*)',
  ],
};
