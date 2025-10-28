# TASK-CAT-010 - Create Category Dropdown Component with Color Swatches

## Context & Goal

**Business Value:** Provide intuitive category selection in transaction forms (UX-005)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** UX-005 (Category dropdown with colors)

## Scope Definition

**✅ In Scope:**

- Reusable CategorySelect component
- Color swatches (12px circle) next to names
- Grouped by type (expense/income headers)
- Searchable/filterable
- Type filtering (show only expense OR income)

**⛔ Out of Scope:**

- Recent categories (V1.1)
- Favorite categories (V2)

## Technical Specifications

```typescript
// /components/categories/category-select.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'expense' | 'income';
  placeholder?: string;
}

export function CategorySelect({
  value,
  onChange,
  type,
  placeholder = 'Select category...',
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data));
  }, []);

  const filteredCategories = type
    ? categories.filter(c => c.type === type)
    : categories;

  const expenseCategories = filteredCategories.filter(
    c => c.type === 'expense'
  );
  const incomeCategories = filteredCategories.filter(c => c.type === 'income');

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: categories.find(c => c.id === value)?.color,
                }}
              />
              {categories.find(c => c.id === value)?.name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {expenseCategories.length > 0 && (
          <SelectGroup>
            <SelectLabel>Expenses</SelectLabel>
            {expenseCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {incomeCategories.length > 0 && (
          <SelectGroup>
            <SelectLabel>Income</SelectLabel>
            {incomeCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
```

## Acceptance Criteria

1. **Given** CategorySelect rendered
   **When** opening dropdown
   **Then** categories grouped with "Expenses" and "Income" headers

2. **Given** category options
   **When** viewing
   **Then** each shows 12px color circle + name

3. **Given** type="expense" prop
   **When** opening dropdown
   **Then** only expense categories shown

4. **Given** selected category
   **When** dropdown closed
   **Then** trigger shows color swatch + name

## Definition of Done

- [x] CategorySelect component created
- [x] Color swatches (12px circles)
- [x] Grouped by type
- [x] Type filtering prop
- [x] Fetches categories from API
- [x] Accessible (keyboard navigation)

## Dependencies

**Upstream:** TASK-CAT-002 (GET endpoint), TASK-FOUND-002 (Select component)  
**Effort:** 4 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
