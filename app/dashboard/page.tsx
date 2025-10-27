import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            BudgetBuddy
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold">Dashboard</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Dashboard coming soon. You&apos;re logged in as{' '}
              <span className="font-semibold text-foreground">{session.user.email}</span>
            </p>

            <div className="bg-card rounded-lg border p-8 text-left">
              <h2 className="mb-4 text-2xl font-semibold">What&apos;s Next?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Transaction management and tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Category and account organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Beautiful charts and insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Cash-flow tracking and reports</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
