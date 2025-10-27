# TASK-DASH-006 - Build Category Breakdown Donut Chart Component

## Context & Goal

**Business Value:** Visualize spending distribution by category (FR-042, US-008, UX-008)  
**Epic:** EPIC-06 Dashboard & Reporting  
**User Story:** US-DASH-02 - View category breakdown chart  
**PRD Reference:** FR-042, UX-008 (Donut chart design)

## Scope Definition

**✅ In Scope:**

- Donut chart component using Recharts
- Fetch from /api/reports/by-category
- Color-coded segments from category colors
- Legend with category names and percentages
- Tooltip on hover with amounts
- 60% inner radius (donut hole)

**⛔ Out of Scope:**

- Click-through to filter (TASK-DASH-010)

## Technical Specifications

```typescript
// /components/dashboard/category-breakdown.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/chart-utils';

export function CategoryBreakdownChart({ from, to }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/reports/by-category?from=${from}&to=${to}&type=expense`)
      .then(res => res.json())
      .then(result => setData(result.data));
  }, [from, to]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No expense data for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="total"
              nameKey="categoryName"
              label={({ categoryName, percentage }) =>
                `${categoryName} ${percentage}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.categoryColor} />
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
                `${value}: ${formatCurrency(entry.payload.total)} (${
                  entry.payload.percentage
                }%)`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

## Acceptance Criteria

1. **Given** expense transactions across categories
   **When** rendering chart
   **Then** donut chart with colored segments displayed

2. **Given** category in chart
   **When** hovering
   **Then** tooltip shows category name and amount in EUR

3. **Given** legend
   **When** viewing
   **Then** shows all categories with amounts and percentages

4. **Given** no expense data
   **When** rendering
   **Then** empty state message displayed

5. **Given** mobile viewport
   **When** viewing chart
   **Then** chart scales responsively (min-height 300px)

## Definition of Done

- [ ] CategoryBreakdownChart component created
- [ ] Fetches from by-category endpoint
- [ ] Donut chart (60% inner radius)
- [ ] Category colors from API
- [ ] Tooltip with EUR formatting
- [ ] Legend with percentages
- [ ] Empty state
- [ ] Responsive

## Dependencies

**Upstream:** TASK-DASH-002 (Endpoint), TASK-FOUND-006 (Recharts)  
**Effort:** 7 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
