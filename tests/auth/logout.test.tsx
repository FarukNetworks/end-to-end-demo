import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from '@/components/auth/logout-button';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}));

// Import after mocking
import { signOut } from 'next-auth/react';

describe('LogoutButton', () => {
  const mockSignOut = vi.mocked(signOut);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logout button with correct text', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls signOut with correct parameters when clicked', async () => {
    mockSignOut.mockResolvedValue({ url: '/login' } as any);

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /logout/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        callbackUrl: '/login',
        redirect: true,
      });
    });
  });

  it('shows loading state during logout', async () => {
    // Make signOut pending
    mockSignOut.mockImplementation(() => new Promise(() => {}));

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /logout/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Logging out...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('disables button during logout process', async () => {
    mockSignOut.mockImplementation(() => new Promise(() => {}));

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /logout/i });

    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('handles logout errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Logout failed'));

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /logout/i });

    fireEvent.click(button);

    // Wait for error handling
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    // Button should be re-enabled after error
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
