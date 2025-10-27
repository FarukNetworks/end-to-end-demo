import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { FeatureCard } from '@/components/landing/feature-card';
import { Button } from '@/components/ui/button';
import { Shield, Zap, PieChart } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession();

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-6 py-16 md:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
              Track Your Spending.{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Keep Your Privacy.
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              The lightweight finance tracker built for privacy-conscious Europeans. No bank access
              required, no complexity—just clarity.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-lg">
                <Link href="/signup">Start Tracking Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link href="#features">See How It Works</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>🇪🇺 EU-hosted</span>
              <span>•</span>
              <span>100% Private</span>
              <span>•</span>
              <span>Always Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Finance Tracking, Done Right
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to understand your spending, nothing you don't.
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Your Data, Your Eyes Only"
              description="No bank linking, no third-party tracking. Manual entry means total control and zero privacy concerns."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Log Expenses in Under 10 Seconds"
              description="Smart defaults, keyboard shortcuts, and mobile-optimized forms. Capture spending without breaking your flow."
            />
            <FeatureCard
              icon={<PieChart className="h-6 w-6" />}
              title="See Where Your Money Goes"
              description="Beautiful donut charts, cash-flow trends, and category breakdowns. Understand your spending at a glance."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Take Control?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of users tracking their finances the privacy-first way.
            </p>
            <Button asChild size="lg" className="text-lg">
              <Link href="/signup">Create Free Account</Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Set up in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 BudgetBuddy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
