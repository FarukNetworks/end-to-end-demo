'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/chart-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardsProps {
  from: string;
  to: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
}

function KPICardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function KPICards({ from, to }: KPICardsProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/reports/summary?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [from, to]);

  if (isLoading) {
    return <KPICardsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data?.totalIncome || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data?.totalExpense || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (data?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(data?.net || 0)}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.transactionCount || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
