'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { chartColors, formatCurrency } from '@/lib/chart-utils';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
}

export function DonutChart({ data, height = 300 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={(props) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { name, percent } = props as any;
            return `${name} ${(percent * 100).toFixed(0)}%`;
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || chartColors.primary} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload = (entry as any).payload;
            return `${value}: ${formatCurrency(payload.value)}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
