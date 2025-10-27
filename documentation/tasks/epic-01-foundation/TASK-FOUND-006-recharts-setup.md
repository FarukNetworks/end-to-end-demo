# TASK-FOUND-006 - Configure Recharts for Data Visualization

## Context & Goal

**Business Value:** Enable data visualization for dashboard charts to provide spending insights (FR-042, FR-044)  
**Epic:** EPIC-01 Foundation & Infrastructure  
**PRD Reference:** Section 9 (Charts: Recharts), FR-042 (Donut chart), FR-044 (Line chart)

## Scope Definition

**✅ In Scope:**

- Recharts library installation
- Chart component wrappers with consistent styling
- Responsive chart configuration
- Accessibility setup for charts
- Color palette configuration matching design tokens
- Example chart components (Donut, Line)
- TypeScript type safety for chart data

**⛔ Out of Scope:**

- Actual dashboard implementation (EPIC-06)
- Data aggregation logic (DASH endpoints)
- Chart interactivity (click handlers) - handled in DASH tasks

## Technical Specifications

**Implementation Details:**

- Install Recharts:

  ```bash
  npm install recharts
  ```

- Create chart utilities in `/lib/chart-utils.ts`:

  ```typescript
  import { CSSProperties } from 'react';

  export const chartColors = {
    primary: '#3b82f6',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6',
    orange: '#f97316',
  };

  export const categoryColors = [
    chartColors.success,
    chartColors.warning,
    chartColors.primary,
    chartColors.purple,
    chartColors.danger,
    chartColors.pink,
    chartColors.teal,
    chartColors.orange,
  ];

  export const chartConfig = {
    responsive: {
      width: '100%',
      height: 300,
    },
    margin: {
      top: 5,
      right: 30,
      left: 20,
      bottom: 5,
    },
  };

  export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  export function formatNumber(value: number): string {
    return new Intl.NumberFormat('de-DE').format(value);
  }
  ```

- Create example Donut Chart wrapper in `/components/charts/DonutChart.tsx`:

  ```typescript
  'use client';

  import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
  } from 'recharts';
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
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || chartColors.primary}
              />
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
            formatter={(value, entry: any) =>
              `${value}: ${formatCurrency(entry.payload.value)}`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  ```

- Create example Line Chart wrapper in `/components/charts/LineChart.tsx`:

  ```typescript
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
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={value => `€${(value / 1000).toFixed(0)}K`}
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
  ```

**Architecture References:**

- Recharts documentation: https://recharts.org/
- PRD Section 9: Charts specification
- PRD UX-008, UX-009: Chart design requirements

## Acceptance Criteria

1. **Given** Recharts installed
   **When** importing in a component
   **Then** no TypeScript errors and library works correctly

2. **Given** DonutChart component with data
   **When** rendering chart
   **Then** chart displays with correct colors and responsive sizing

3. **Given** LineChart component with data
   **When** rendering chart
   **Then** chart displays income (green), expense (red), net (blue) lines

4. **Given** chart with hover interaction
   **When** hovering over data point
   **Then** tooltip displays formatted EUR currency values

5. **Given** mobile viewport (<768px)
   **When** rendering charts
   **Then** charts scale responsively maintaining aspect ratio

## Definition of Done

- [ ] Recharts library installed and configured
- [ ] Chart utilities (colors, formatters) created
- [ ] DonutChart wrapper component implemented
- [ ] LineChart wrapper component implemented
- [ ] Charts responsive across all breakpoints
- [ ] Tooltip formatting uses EUR currency format
- [ ] Color palette matches PRD design tokens
- [ ] TypeScript types for chart data props
- [ ] Example usage documented in Storybook or README
- [ ] Charts render without console errors or warnings

## Dependencies

**Upstream Tasks:** TASK-FOUND-002 (shadcn/ui for theming)  
**External Dependencies:** recharts  
**Parallel Tasks:** TASK-FOUND-001 to FOUND-005  
**Downstream Impact:** DASH-006 (Donut chart), DASH-007 (Line chart)

## Resources & References

**Design Assets:** TBD (Figma mockups)  
**Technical Docs:**

- Recharts: https://recharts.org/en-US/guide
- Recharts Examples: https://recharts.org/en-US/examples

**PRD References:** Section 9 (Charts), UX-008, UX-009, FR-042, FR-044  
**SAS References:** TBD

## Estimation & Priority

**Effort Estimate:** 3 story points (4-6 hours)

- Library installation: 0.5 hours
- Chart utilities: 1 hour
- DonutChart component: 1.5 hours
- LineChart component: 1.5 hours
- Testing and documentation: 1 hour

**Priority:** P0 (Must-have - blocks dashboard charts)  
**Risk Level:** Low (well-documented library)

## Assignment

**Primary Owner:** TBD (Frontend Engineer)  
**Code Reviewer:** TBD (Design Lead)  
**QA Owner:** TBD (Visual QA)  
**Stakeholder:** Design Lead
