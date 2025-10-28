import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { AccountList } from '@/components/accounts/account-list';
import { AddAccountButton } from '@/components/accounts/add-account-button';

export const metadata = {
  title: 'Accounts - BudgetBuddy',
};

export default async function AccountsPage() {
  const user = await requireAuth();

  // Fetch accounts with transaction counts
  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { txns: true },
      },
    },
  });

  // Calculate balance for each account
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => {
      const transactions = await db.transaction.findMany({
        where: { accountId: account.id, userId: user.id },
        select: { amount: true, type: true },
      });

      const balance = transactions.reduce((sum, txn) => {
        return txn.type === 'income' ? sum + Number(txn.amount) : sum - Number(txn.amount);
      }, 0);

      return {
        ...account,
        balance,
      };
    })
  );

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Accounts</h1>
          <AddAccountButton />
        </div>

        <AccountList accounts={accountsWithBalances} />
      </div>
    </div>
  );
}
