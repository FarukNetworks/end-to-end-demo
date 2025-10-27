import { SignupForm } from '@/components/auth/signup-form';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up - BudgetBuddy',
  description: 'Create your BudgetBuddy account',
};

export default function SignupPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Start tracking your finances in minutes</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
