# TASK-DASH-011 - Add Accessible Data Tables for Charts (WCAG AA)

## Context & Goal

**Business Value:** Ensure charts are accessible to screen reader users (NF-024)  
**Epic:** EPIC-06 Dashboard & Reporting  
**PRD Reference:** NF-024 (Charts with accessible data tables)

## Scope Definition

**✅ In Scope:**

- Data table version of donut chart
- Data table version of line chart
- Toggle to switch between chart and table view
- Proper table markup (th, caption, etc.)
- Screen reader announcements

**⛔ Out of Scope:**

- Advanced table features (sorting, etc.) - V2

## Technical Specifications

```typescript
// /components/dashboard/category-breakdown.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from 'lucide-react';

export function CategoryBreakdownChart({ from, to }) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spending by Category</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(v => (v === 'chart' ? 'table' : 'chart'))}
          aria-label={`Switch to ${
            viewMode === 'chart' ? 'table' : 'chart'
          } view`}
        >
          <Table className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {viewMode === 'chart' ? (
          <PieChart>{/* ... */}</PieChart>
        ) : (
          <table className="w-full">
            <caption className="sr-only">
              Spending breakdown by category
            </caption>
            <thead>
              <tr>
                <th scope="col" className="text-left">
                  Category
                </th>
                <th scope="col" className="text-right">
                  Amount
                </th>
                <th scope="col" className="text-right">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.categoryId}>
                  <td className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    {item.categoryName}
                  </td>
                  <td className="text-right">{formatCurrency(item.total)}</td>
                  <td className="text-right">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
```

## Acceptance Criteria

1. **Given** chart view
   **When** clicking table toggle
   **Then** data table version shown

2. **Given** table view
   **When** using screen reader
   **Then** table structure announced correctly

3. **Given** table
   **When** reviewing markup
   **Then** proper th, caption, scope attributes present

## Definition of Done

- [ ] Table view for category breakdown
- [ ] Table view for cashflow
- [ ] Toggle button between chart/table
- [ ] Proper table semantics
- [ ] Screen reader tested
- [ ] Axe audit passes

## Dependencies

**Upstream:** TASK-DASH-006, TASK-DASH-007  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
