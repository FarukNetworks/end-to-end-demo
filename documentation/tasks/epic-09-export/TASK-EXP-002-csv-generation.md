# TASK-EXP-002 - Create CSV Generation Logic

## Context & Goal

**Business Value:** Reusable CSV generation utilities (FR-051)  
**Epic:** EPIC-09 Data Export (Stretch - V1.1)  
**PRD Reference:** FR-051 (CSV format specification)

## Scope Definition

**✅ In Scope:**

- CSV generation utility function
- Proper escaping (commas, quotes, newlines)
- Header row generation
- Type-safe column mapping
- Large dataset handling (streaming for future)

**⛔ Out of Scope:**

- Other formats (JSON, Excel) - V2

## Technical Specifications

```typescript
// /lib/csv.ts
export interface CSVColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = col.accessor(row);
      return escapeCSVValue(value.toString());
    })
  );

  const csvRows = [headers, ...rows];
  return csvRows.map(row => row.join(',')).join('\n');
}

function escapeCSVValue(value: string): string {
  // Escape if contains comma, quote, or newline
  if (/[,"\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Transaction-specific export
export function transactionsToCSV(transactions: any[]): string {
  return generateCSV(transactions, [
    {
      header: 'Date',
      accessor: t => new Date(t.txnDate).toLocaleDateString('de-DE'),
    },
    { header: 'Type', accessor: t => t.type },
    { header: 'Amount', accessor: t => t.amount },
    { header: 'Currency', accessor: t => t.currency },
    { header: 'Category', accessor: t => t.category.name },
    { header: 'Account', accessor: t => t.account.name },
    { header: 'Note', accessor: t => t.note || '' },
    { header: 'Tags', accessor: t => t.tags.join(', ') },
  ]);
}
```

## Acceptance Criteria

1. **Given** data with special characters
   **When** generating CSV
   **Then** proper escaping applied

2. **Given** large dataset (10k rows)
   **When** generating CSV
   **Then** completes without memory issues

3. **Given** empty data
   **When** generating CSV
   **Then** headers only returned

## Definition of Done

- [ ] generateCSV utility created
- [ ] escapeCSVValue function
- [ ] transactionsToCSV helper
- [ ] Unit tests for CSV generation
- [ ] Unit tests for special character escaping
- [ ] Used in EXP-001 endpoint

## Dependencies

**Upstream:** None (utility function)  
**Effort:** 4 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Backend Engineer)
