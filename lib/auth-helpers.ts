import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Server Component helper to require authentication
 * Redirects to /login if user is not authenticated
 * @returns Authenticated user object
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
}

/**
 * Server Component helper to get current user without redirecting
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
