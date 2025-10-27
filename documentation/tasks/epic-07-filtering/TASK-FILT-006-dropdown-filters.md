# TASK-FILT-006 - Implement Account and Category Filter Dropdowns

## Context & Goal

**Business Value:** Enable filtering by category and account (FR-036)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-036 (Category/account filters)

## Scope Definition

**✅ In Scope:**

- Account dropdown filter in filters bar
- Category dropdown filter in filters bar
- "All" option for clearing filter
- Integration with existing CategorySelect

**⛔ Out of Scope:**

- Multi-select filters (V1.1)

## Technical Specifications

```typescript
// Add to FiltersBar component
import { AccountSelect } from '@/components/accounts/account-select';

// In FiltersBar
<CategorySelect
  value={filters.categoryId}
  onChange={categoryId => setFilters(prev => ({ ...prev, categoryId }))}
  placeholder="All categories"
  allowClear
/>

<AccountSelect
  value={filters.accountId}
  onChange={accountId => setFilters(prev => ({ ...prev, accountId }))}
  placeholder="All accounts"
  allowClear
/>

// Create AccountSelect similar to CategorySelect
// /components/accounts/account-select.tsx
export function AccountSelect({ value, onChange, allowClear, placeholder }) {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.data));
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="">All accounts</SelectItem>
        )}
        {accounts.map(account => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: account.color }}
              />
              {account.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

## Acceptance Criteria

1. **Given** category filter dropdown
   **When** selecting category
   **Then** filter updates

2. **Given** account filter dropdown
   **When** selecting account
   **Then** filter updates

3. **Given** "All categories" selected
   **When** applying
   **Then** category filter cleared (no categoryId param)

4. **Given** filters in URL
   **When** loading page
   **Then** dropdown pre-selected with filter values

## Definition of Done

- [ ] AccountSelect component created
- [ ] Integration in FiltersBar
- [ ] "All" option for clearing
- [ ] Pre-select from URL params
- [ ] Color swatches in dropdowns

## Dependencies

**Upstream:** TASK-CAT-010 (CategorySelect pattern), TASK-ACC-002 (Accounts API)  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
