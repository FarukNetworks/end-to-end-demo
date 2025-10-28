'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, chartColors } from '@/lib/chart-utils';

interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export function CashFlowChart() {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/reports/cashflow?months=6')
      .then((res) => res.json())
      .then((result) => setData(result.data || []))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke={chartColors.success}
              strokeWidth={2}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke={chartColors.danger}
              strokeWidth={2}
              name="Expense"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke={chartColors.primary}
              strokeWidth={2}
              name="Net"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
