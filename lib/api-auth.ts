import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * API route helper to require authentication
 * Returns error response if user is not authenticated
 * @returns Object with error (NextResponse | null) and user (User | null)
 */
export async function requireApiAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        {
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      ),
      user: null,
    };
  }

  return {
    error: null,
    user: session.user,
  };
}
