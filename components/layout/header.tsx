import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { AddTransactionButton } from '@/components/transactions/add-transaction-button';
import { UserMenu } from './user-menu';

export async function Header() {
  const session = await getServerSession(authOptions);

  // If no session, don't render the header
  if (!session?.user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">BudgetBuddy</h1>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <AddTransactionButton />
          <UserMenu userEmail={session.user.email || ''} />
        </div>
      </div>
    </header>
  );
}
