# TASK-EXP-003 - Add Export Button to Settings Page

## Context & Goal

**Business Value:** Provide UI access to CSV export feature (FR-051)  
**Epic:** EPIC-09 Data Export (Stretch - V1.1)  
**PRD Reference:** FR-051 (Export button), Navigation /settings

## Scope Definition

**✅ In Scope:**

- Settings page creation
- "Export Transactions CSV" button
- Download trigger
- Loading state during export

**⛔ Out of Scope:**

- Other settings features (V2)
- Account deletion UI (separate task)

## Technical Specifications

```typescript
// /app/settings/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { ExportSection } from '@/components/settings/export-section';

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Export your transactions to CSV format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExportSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

```typescript
// /components/settings/export-section.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/lib/toast';

export function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/transactions/export.csv');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budgetbuddy-transactions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Transactions exported successfully!');
    } catch (error) {
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export Transactions CSV'}
    </Button>
  );
}
```

## Acceptance Criteria

1. **Given** /settings page
   **When** clicking "Export Transactions CSV"
   **Then** CSV file downloads

2. **Given** export in progress
   **When** checking button
   **Then** button disabled and shows "Exporting..."

3. **Given** export completes
   **When** checking downloads
   **Then** file named budgetbuddy-transactions-YYYY-MM-DD.csv

4. **Given** export succeeds
   **When** checking toast
   **Then** success message shown

## Definition of Done

- [ ] /settings page created
- [ ] ExportSection component created
- [ ] Export button with download trigger
- [ ] Loading state
- [ ] Success/error toasts
- [ ] File download works

## Dependencies

**Upstream:** TASK-EXP-001 (Export endpoint)  
**Effort:** 2 SP  
**Priority:** P2

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
