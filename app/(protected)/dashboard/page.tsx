import { requireAuth } from '@/lib/auth-helpers';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown';
import { CashFlowChart } from '@/components/dashboard/cashflow-chart';
import { DateRangeFilter } from '@/components/dashboard/date-range-filter';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireAuth();

  const params = await searchParams;

  // Default to "This Month" - using UTC to avoid timezone issues
  const now = new Date();
  const from =
    params.from ||
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10);
  const to = params.to || now.toISOString().slice(0, 10);

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DateRangeFilter />
      </div>

      <KPICards from={from} to={to} />

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryBreakdownChart from={from} to={to} />
        <CashFlowChart />
      </div>
    </div>
  );
}
