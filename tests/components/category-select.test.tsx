import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CategorySelect } from '@/components/categories/category-select';
import type { Category } from '@prisma/client';

/**
 * NOTE: Some interactive tests with Radix UI Select are limited by JSDOM's
 * lack of support for hasPointerCapture(). This is a known limitation when
 * testing Radix UI components in JSDOM. These tests focus on what can be
 * tested: data fetching, error handling, loading states, and rendering logic.
 * Full interactive testing should be done via E2E tests or manual testing.
 */

// Mock fetch globally
global.fetch = vi.fn();

describe('CategorySelect', () => {
  const mockOnChange = vi.fn();

  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Groceries',
      color: '#ef4444',
      type: 'expense',
      isSystem: true,
      userId: 'user-1',
      createdAt: new Date(),
    },
    {
      id: 'cat-2',
      name: 'Transportation',
      color: '#f59e0b',
      type: 'expense',
      isSystem: true,
      userId: 'user-1',
      createdAt: new Date(),
    },
    {
      id: 'cat-3',
      name: 'Entertainment',
      color: '#8b5cf6',
      type: 'expense',
      isSystem: true,
      userId: 'user-1',
      createdAt: new Date(),
    },
    {
      id: 'cat-4',
      name: 'Salary',
      color: '#22c55e',
      type: 'income',
      isSystem: true,
      userId: 'user-1',
      createdAt: new Date(),
    },
    {
      id: 'cat-5',
      name: 'Freelance',
      color: '#10b981',
      type: 'income',
      isSystem: false,
      userId: 'user-1',
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockCategories }),
    });
  });

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      render(<CategorySelect value="" onChange={mockOnChange} />);

      expect(screen.getByText('Loading categories...')).toBeInTheDocument();
    });

    it('disables select during loading', () => {
      render(<CategorySelect value="" onChange={mockOnChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Data Fetching', () => {
    it('fetches categories from /api/categories on mount', async () => {
      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/categories');
      });
    });

    it('enables select after successful fetch', async () => {
      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading categories')).toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('shows error state when response is not ok', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading categories')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no categories returned', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('No categories available')).toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Category Display', () => {
    it('displays selected category with color swatch in trigger', async () => {
      render(<CategorySelect value="cat-1" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Groceries')).toBeInTheDocument();
        const trigger = screen.getByRole('combobox');
        const colorSwatch = trigger.querySelector('.h-3.w-3.rounded-full');
        expect(colorSwatch).toBeInTheDocument();
        expect(colorSwatch).toHaveStyle({ backgroundColor: '#ef4444' });
      });
    });

    it('displays income category correctly', async () => {
      render(<CategorySelect value="cat-4" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
        const trigger = screen.getByRole('combobox');
        const colorSwatch = trigger.querySelector('.h-3.w-3.rounded-full');
        expect(colorSwatch).toHaveStyle({ backgroundColor: '#22c55e' });
      });
    });
  });

  describe('Props', () => {
    it('respects disabled prop', async () => {
      render(<CategorySelect value="" onChange={mockOnChange} disabled />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('uses custom placeholder when provided', async () => {
      render(
        <CategorySelect value="" onChange={mockOnChange} placeholder="Choose a category..." />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Choose a category...')).toBeInTheDocument();
    });

    it('shows default placeholder when not provided', async () => {
      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Select category...')).toBeInTheDocument();
    });

    it('accepts type prop for filtering', async () => {
      // Component should accept type prop without errors
      render(<CategorySelect value="" onChange={mockOnChange} type="expense" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('renders as a combobox for keyboard navigation', async () => {
      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed API response gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      render(<CategorySelect value="" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('No categories available')).toBeInTheDocument();
      });
    });

    it('handles value that does not match any category', async () => {
      render(<CategorySelect value="non-existent-id" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('handles categories with special characters', async () => {
      const specialCategories: Category[] = [
        {
          id: 'cat-special',
          name: 'Food & Beverages',
          color: '#ef4444',
          type: 'expense',
          isSystem: false,
          userId: 'user-1',
          createdAt: new Date(),
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: specialCategories }),
      });

      render(<CategorySelect value="cat-special" onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('Food & Beverages')).toBeInTheDocument();
      });
    });
  });
});
