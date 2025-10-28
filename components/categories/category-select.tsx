'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryType } from '@prisma/client';
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
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  type,
  placeholder = 'Select category...',
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Filter categories by type if specified
  const filteredCategories = type ? categories.filter((c) => c.type === type) : categories;

  const expenseCategories = filteredCategories.filter((c) => c.type === CategoryType.expense);
  const incomeCategories = filteredCategories.filter((c) => c.type === CategoryType.income);

  const selectedCategory = categories.find((c) => c.id === value);

  // Show loading state
  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  // Show error state
  if (error) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Error loading categories" />
        </SelectTrigger>
      </Select>
    );
  }

  // Show empty state
  if (categories.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No categories available" />
        </SelectTrigger>
      </Select>
    );
  }

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
