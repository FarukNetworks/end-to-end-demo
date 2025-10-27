import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LogoutButton } from '@/components/auth/logout-button';
import { AddTransactionButton } from '@/components/transactions/add-transaction-button';

export async function Header() {
  const session = await getServerSession(authOptions);

  // If no session, don't render the header
  if (!session?.user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">BudgetBuddy</h1>
        </div>
        <div className="flex items-center gap-4">
          <AddTransactionButton />
          <span className="text-sm text-muted-foreground">{session.user.email}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
