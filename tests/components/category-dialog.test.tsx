import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryDialog } from '@/components/categories/category-dialog';
import type { Category } from '@prisma/client';

type CategoryWithCount = Category & {
  _count: { txns: number };
};

// Mock toast
vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('CategoryDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockCategory: CategoryWithCount = {
    id: '123',
    name: 'Groceries',
    color: '#22c55e',
    type: 'expense',
    isSystem: false,
    userId: 'user-1',
    createdAt: new Date(),
    _count: { txns: 5 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Create Mode', () => {
    it('renders empty form with default values', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Add Category')).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('initializes with default color #22c55e', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const colorInput = screen.getByDisplayValue('#22c55e') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
      expect(colorInput.value).toBe('#22c55e');
    });

    it('initializes with expense type by default', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const typeSelect = screen.getByRole('combobox', { name: /type/i });
      expect(typeSelect).toHaveTextContent('Expense');
    });

    it('validates required name field', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Category name is required');
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('trims whitespace from category name', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });

      await user.type(nameInput, '   ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Category name is required');
      });
    });

    it('submits valid category to POST /api/categories', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });

      await user.type(nameInput, 'Groceries');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Groceries',
            type: 'expense',
            color: '#22c55e',
          }),
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Category created');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('allows selecting preset colors', async () => {
      const user = userEvent.setup();
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      // Find the red preset color button
      const redColorButton = screen.getByLabelText('Select color #ef4444');
      await user.click(redColorButton);

      const colorInput = screen.getByDisplayValue('#ef4444') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    it('allows using native color picker', async () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeTruthy();

      // Simulate color picker change using fireEvent since userEvent doesn't support color input well
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      await waitFor(() => {
        expect(colorInput.value).toBe('#ff0000');
      });
    });

    it('shows error toast when API fails', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Category already exists' } }),
      });

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });

      await user.type(nameInput, 'Groceries');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Category already exists');
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('disables form during submission', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });

      await user.type(nameInput, 'Groceries');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('allows canceling the dialog', async () => {
      const user = userEvent.setup();
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('renders with edit title and prefilled data', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Edit Category')).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toHaveValue('Groceries');
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('prefills category color', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const colorInput = screen.getByDisplayValue('#22c55e') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    it('prefills category type', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const typeSelect = screen.getByRole('combobox', { name: /type/i });
      expect(typeSelect).toHaveTextContent('Expense');
    });

    it('disables type field in edit mode', () => {
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const typeSelect = screen.getByRole('combobox', { name: /type/i });
      expect(typeSelect).toBeDisabled();
      expect(screen.getByText(/category type cannot be changed/i)).toBeInTheDocument();
    });

    it('submits updated category to PATCH /api/categories/:id', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /save/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'Food & Beverages');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/categories/123', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Food & Beverages',
            type: 'expense',
            color: '#22c55e',
          }),
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Category updated');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('allows updating only the color', async () => {
      const user = userEvent.setup();
      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const blueColorButton = screen.getByLabelText('Select color #3b82f6');
      await user.click(blueColorButton);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/categories/123',
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('#3b82f6'),
          })
        );
      });
    });

    it('handles income category correctly', () => {
      const incomeCategory: CategoryWithCount = {
        ...mockCategory,
        type: 'income',
        name: 'Salary',
      };

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={incomeCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const typeSelect = screen.getByRole('combobox', { name: /type/i });
      expect(typeSelect).toHaveTextContent('Income');
      expect(typeSelect).toBeDisabled();
    });

    it('shows error toast when edit API fails', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Duplicate category name' } }),
      });

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /save/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'Transport');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Duplicate category name');
      });
    });
  });

  describe('Dialog Behavior', () => {
    it('resets form when dialog opens in create mode', () => {
      const { rerender } = render(
        <CategoryDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      // Open dialog
      rerender(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      const colorInput = screen.getByDisplayValue('#22c55e') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    it('loads category data when dialog opens in edit mode', () => {
      const { rerender } = render(
        <CategoryDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      rerender(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
          mode="edit"
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('Groceries');
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      const { toast } = await import('@/lib/toast');

      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      render(
        <CategoryDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });

      await user.type(nameInput, 'Groceries');
      await user.click(submitButton);

      await waitFor(() => {
        // Component shows the actual error message from the Error object
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });
});
