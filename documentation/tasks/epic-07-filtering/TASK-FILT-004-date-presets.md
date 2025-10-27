# TASK-FILT-004 - Implement Date Range Preset Buttons

## Context & Goal

**Business Value:** Quick access to common date ranges (FR-037)  
**Epic:** EPIC-07 Transaction List & Filtering  
**PRD Reference:** FR-037 (Date range presets)

## Scope Definition

**✅ In Scope:**

- Preset buttons: This Month, Last Month, This Year, Custom
- Calculate date ranges for presets
- Apply to filters
- Active state styling

**⛔ Out of Scope:**

- Custom presets (V1.1)

## Technical Specifications

```typescript
// /components/transactions/date-range-presets.tsx
const presets = {
  'this-month': () => ({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
    label: 'This Month',
  }),
  'last-month': () => ({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    label: 'Last Month',
  }),
  'this-year': () => ({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
    label: 'This Year',
  }),
};

export function DateRangePresets({ onChange }) {
  const [active, setActive] = useState('this-month');

  const handlePreset = (key: string) => {
    setActive(key);
    const range = presets[key]();
    onChange(range.from, range.to);
  };

  return (
    <div className="flex gap-2">
      {Object.entries(presets).map(([key, getRange]) => (
        <Button
          key={key}
          variant={active === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset(key)}
        >
          {getRange().label}
        </Button>
      ))}
      <Button
        variant={active === 'custom' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActive('custom')}
      >
        Custom
      </Button>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** "This Month" clicked
   **When** applying
   **Then** from = first of month, to = today

2. **Given** "Last Month" clicked
   **When** applying
   **Then** from/to = last month's first/last day

3. **Given** "Custom" clicked
   **When** selected
   **Then** date pickers appear

4. **Given** active preset
   **When** viewing
   **Then** button highlighted with default variant

## Definition of Done

- [ ] DateRangePresets component
- [ ] 3 presets + Custom
- [ ] Date calculation logic
- [ ] Active state styling
- [ ] Integration with filters

## Dependencies

**Upstream:** TASK-FOUND-002  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
