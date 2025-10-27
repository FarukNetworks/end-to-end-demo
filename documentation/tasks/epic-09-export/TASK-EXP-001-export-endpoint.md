# TASK-EXP-001 - Implement GET /api/transactions/export.csv Endpoint

## Context & Goal

**Business Value:** Enable users to export transaction data for external use (FR-051)  
**Epic:** EPIC-09 Data Export (Stretch - V1.1)  
**PRD Reference:** FR-051 (CSV export)

## Scope Definition

**✅ In Scope:**

- GET /api/transactions/export.csv endpoint
- Generate CSV with headers
- Columns: Date, Type, Amount, Currency, Category, Account, Note, Tags
- User scoping
- Content-Disposition header for download

**⛔ Out of Scope:**

- PDF export (V2)
- Scheduled exports (V2)
- Excel format (V2)

## Technical Specifications

```typescript
// /app/api/transactions/export.csv/route.ts
import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { error, user } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from')
    ? new Date(searchParams.get('from')!)
    : undefined;
  const to = searchParams.get('to')
    ? new Date(searchParams.get('to')!)
    : undefined;

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      ...(from && { txnDate: { gte: from } }),
      ...(to && { txnDate: { lte: to } }),
    },
    include: {
      category: { select: { name: true } },
      account: { select: { name: true } },
    },
    orderBy: { txnDate: 'desc' },
  });

  // Generate CSV
  const csvRows = [
    [
      'Date',
      'Type',
      'Amount',
      'Currency',
      'Category',
      'Account',
      'Note',
      'Tags',
    ],
    ...transactions.map(t => [
      new Date(t.txnDate).toLocaleDateString('de-DE'),
      t.type,
      t.amount.toString(),
      t.currency,
      t.category.name,
      t.account.name,
      t.note || '',
      t.tags.join(', '),
    ]),
  ];

  const csv = csvRows.map(row => row.map(escapeCSV).join(',')).join('\n');

  const filename = `budgetbuddy-transactions-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

## Acceptance Criteria

1. **Given** authenticated user
   **When** GET /api/transactions/export.csv
   **Then** CSV file downloads

2. **Given** CSV file
   **When** opening in Excel
   **Then** data properly formatted with headers

3. **Given** from/to parameters
   **When** exporting
   **Then** only transactions in range exported

4. **Given** transaction with comma in note
   **When** exporting
   **Then** properly escaped in CSV

## Definition of Done

- [ ] GET endpoint implemented
- [ ] CSV generation logic
- [ ] Proper CSV escaping
- [ ] Headers included
- [ ] Filename with date
- [ ] Date range filtering
- [ ] Content-Disposition header
- [ ] Integration test

## Dependencies

**Upstream:** TASK-AUTH-003, TASK-TXN-002  
**Effort:** 5 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Backend Engineer)
