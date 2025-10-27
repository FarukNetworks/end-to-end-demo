'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { chartColors, formatCurrency } from '@/lib/chart-utils';

interface LineChartProps {
  data: Array<{
    name: string;
    income: number;
    expense: number;
    net: number;
  }>;
  height?: number;
}

export function CashFlowLineChart({ data, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke={chartColors.success}
          strokeWidth={2}
          dot={{ fill: chartColors.success }}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke={chartColors.danger}
          strokeWidth={2}
          dot={{ fill: chartColors.danger }}
          name="Expense"
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={{ fill: chartColors.primary }}
          name="Net"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
