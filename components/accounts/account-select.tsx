'use client';

/**
 * AccountSelect Component (Placeholder)
 *
 * This is a placeholder component with mock data.
 * Full implementation will be done in TASK-ACC-007 or related account tasks which includes:
 * - Fetching accounts from GET /api/accounts
 * - Real-time account data
 * - Account creation integration
 *
 * For now, this uses hardcoded mock accounts to unblock transaction form development.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Account {
  id: string;
  name: string;
  color: string;
}

// Mock accounts - will be replaced with API fetch in account management tasks
const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Cash', color: '#10b981' },
  { id: 'acc-2', name: 'Credit Card', color: '#3b82f6' },
  { id: 'acc-3', name: 'Checking Account', color: '#8b5cf6' },
  { id: 'acc-4', name: 'Savings Account', color: '#f59e0b' },
];

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AccountSelect({
  value,
  onChange,
  placeholder = 'Select account...',
  disabled = false,
}: AccountSelectProps) {
  const selectedAccount = MOCK_ACCOUNTS.find((a) => a.id === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedAccount && (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedAccount.color }}
              />
              <span>{selectedAccount.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MOCK_ACCOUNTS.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color }} />
              <span>{account.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
