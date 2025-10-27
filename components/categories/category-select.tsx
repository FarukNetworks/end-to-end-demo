'use client';

/**
 * CategorySelect Component (Placeholder)
 *
 * This is a placeholder component with mock data.
 * Full implementation will be done in TASK-CAT-010 which includes:
 * - Fetching categories from GET /api/categories
 * - Real-time category data
 * - Category creation integration
 *
 * For now, this uses hardcoded mock categories to unblock transaction form development.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  color: string;
  type: 'expense' | 'income';
}

// Mock categories - will be replaced with API fetch in TASK-CAT-010
const MOCK_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'cat-1', name: 'Groceries', color: '#ef4444', type: 'expense' },
  { id: 'cat-2', name: 'Transportation', color: '#f59e0b', type: 'expense' },
  { id: 'cat-3', name: 'Entertainment', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-4', name: 'Utilities', color: '#3b82f6', type: 'expense' },
  { id: 'cat-5', name: 'Healthcare', color: '#ec4899', type: 'expense' },
  { id: 'cat-6', name: 'Dining Out', color: '#f97316', type: 'expense' },
  // Income categories
  { id: 'cat-7', name: 'Salary', color: '#22c55e', type: 'income' },
  { id: 'cat-8', name: 'Freelance', color: '#10b981', type: 'income' },
  { id: 'cat-9', name: 'Investments', color: '#14b8a6', type: 'income' },
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'expense' | 'income';
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  type,
  placeholder = 'Select category...',
  disabled = false,
}: CategorySelectProps) {
  // Filter categories by type if specified
  const filteredCategories = type
    ? MOCK_CATEGORIES.filter((c) => c.type === type)
    : MOCK_CATEGORIES;

  const expenseCategories = filteredCategories.filter((c) => c.type === 'expense');
  const incomeCategories = filteredCategories.filter((c) => c.type === 'income');

  const selectedCategory = MOCK_CATEGORIES.find((c) => c.id === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span>{selectedCategory.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {expenseCategories.length > 0 && (
          <SelectGroup>
            <SelectLabel>Expenses</SelectLabel>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {incomeCategories.length > 0 && (
          <SelectGroup>
            <SelectLabel>Income</SelectLabel>
            {incomeCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
