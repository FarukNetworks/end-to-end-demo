# TASK-DASH-007 - Build Monthly Cash-Flow Line Chart Component

## Context & Goal

**Business Value:** Visualize income vs. expense trends over time (FR-044, US-009, UX-009)  
**Epic:** EPIC-06 Dashboard & Reporting  
**User Story:** US-DASH-03 - See monthly cash-flow  
**PRD Reference:** FR-044, UX-009 (Green/red fill)

## Scope Definition

**✅ In Scope:**

- Line chart component using Recharts
- Fetch from /api/reports/cashflow
- 3 lines: income (green), expense (red), net (blue)
- Tooltip with exact values
- 6 months default
- Responsive

**⛔ Out of Scope:**

- Zoom/pan (V1.1)

## Technical Specifications

```typescript
// /components/dashboard/cashflow-chart.tsx
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
import { formatCurrency } from '@/lib/chart-utils';
import { chartColors } from '@/lib/chart-utils';

export function CashFlowChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/reports/cashflow?months=6')
      .then(res => res.json())
      .then(result => setData(result.data));
  }, []);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={value => `€${(value / 1000).toFixed(0)}K`} />
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
```

## Acceptance Criteria

1. **Given** cashflow data
   **When** rendering chart
   **Then** 3 lines displayed (income green, expense red, net blue)

2. **Given** data point hover
   **When** hovering
   **Then** tooltip shows month, income, expense, net values

3. **Given** Y-axis
   **When** viewing
   **Then** values formatted as €XK (thousands)

4. **Given** responsive design
   **When** mobile viewport
   **Then** chart scales maintaining aspect ratio

## Definition of Done

- [ ] CashFlowChart component created
- [ ] Fetches from cashflow endpoint
- [ ] 3 lines (income, expense, net)
- [ ] Color-coded (green, red, blue)
- [ ] Tooltip with EUR formatting
- [ ] Legend
- [ ] Responsive

## Dependencies

**Upstream:** TASK-DASH-003 (Endpoint), TASK-FOUND-006 (Recharts)  
**Effort:** 7 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
