import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PATCH } from '@/app/api/transactions/[id]/route';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';
import { TxnType } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/api-auth');
vi.mock('@/lib/db', () => ({
  db: {
    category: {
      findFirst: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
    transaction: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'test@example.com',
};

const mockTransaction = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: '550e8400-e29b-41d4-a716-446655440001',
  amount: 100,
  type: TxnType.expense,
  categoryId: '550e8400-e29b-41d4-a716-446655440002',
  accountId: '550e8400-e29b-41d4-a716-446655440003',
  txnDate: new Date('2024-01-15'),
  note: 'Original note',
  tags: ['tag1'],
  currency: 'EUR',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  userId: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Groceries',
  type: 'expense' as const,
  color: '#22c55e',
};

const mockAccount = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  userId: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Checking',
  color: '#6b7280',
};

describe('PATCH /api/transactions/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiAuth).mockResolvedValue({
      error: null,
      user: mockUser,
    });
  });

  it('should update transaction with partial data (only amount)', async () => {
    const updatedTransaction = {
      ...mockTransaction,
      amount: 150,
      updatedAt: new Date(),
      category: { name: 'Groceries', color: '#22c55e' },
      account: { name: 'Checking' },
    };

    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(db.transaction.findFirst).mockResolvedValue(updatedTransaction);

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ amount: 150 }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.amount).toBe(150);
    expect(db.transaction.updateMany).toHaveBeenCalledWith({
      where: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      },
      data: { amount: 150 },
    });
  });

  it('should return 404 for transaction belonging to different user', async () => {
    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 0 });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440099',
      {
        method: 'PATCH',
        body: JSON.stringify({ amount: 150 }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440099' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('Transaction not found');
  });

  it('should return 400 for invalid amount (negative)', async () => {
    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ amount: -50 }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('positive');
  });

  it('should return 400 for amount with too many decimals', async () => {
    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ amount: 100.999 }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('decimal places');
  });

  it('should return 400 if no fields provided', async () => {
    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('At least one field');
  });

  it('should verify updatedAt timestamp is updated', async () => {
    const originalDate = new Date('2024-01-15');
    const newDate = new Date();

    const updatedTransaction = {
      ...mockTransaction,
      amount: 150,
      updatedAt: newDate,
      category: { name: 'Groceries', color: '#22c55e' },
      account: { name: 'Checking' },
    };

    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(db.transaction.findFirst).mockResolvedValue(updatedTransaction);

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ amount: 150 }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(new Date(data.data.updatedAt).getTime()).toBeGreaterThan(originalDate.getTime());
  });

  it('should update categoryId and verify ownership', async () => {
    const newCategoryId = '550e8400-e29b-41d4-a716-446655440020';
    vi.mocked(db.category.findFirst).mockResolvedValue({
      ...mockCategory,
      id: newCategoryId,
    });
    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(db.transaction.findFirst).mockResolvedValue({
      ...mockTransaction,
      categoryId: newCategoryId,
      category: { name: 'New Category', color: '#ff0000' },
      account: { name: 'Checking' },
    });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ categoryId: newCategoryId }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });

    expect(response.status).toBe(200);
    expect(db.category.findFirst).toHaveBeenCalledWith({
      where: { id: newCategoryId, userId: '550e8400-e29b-41d4-a716-446655440001' },
    });
  });

  it('should return 404 for category not owned by user', async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null);

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ categoryId: '550e8400-e29b-41d4-a716-446655440099' }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('INVALID_CATEGORY');
  });

  it('should update accountId and verify ownership', async () => {
    const newAccountId = '550e8400-e29b-41d4-a716-446655440030';
    vi.mocked(db.account.findFirst).mockResolvedValue({
      ...mockAccount,
      id: newAccountId,
    });
    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(db.transaction.findFirst).mockResolvedValue({
      ...mockTransaction,
      accountId: newAccountId,
      category: { name: 'Groceries', color: '#22c55e' },
      account: { name: 'Savings' },
    });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ accountId: newAccountId }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });

    expect(response.status).toBe(200);
    expect(db.account.findFirst).toHaveBeenCalledWith({
      where: { id: newAccountId, userId: '550e8400-e29b-41d4-a716-446655440001' },
    });
  });

  it('should return 404 for account not owned by user', async () => {
    vi.mocked(db.account.findFirst).mockResolvedValue(null);

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ accountId: '550e8400-e29b-41d4-a716-446655440099' }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('INVALID_ACCOUNT');
  });

  it('should return 400 when changing category to one with mismatched type', async () => {
    const incomeCategoryId = '550e8400-e29b-41d4-a716-446655440040';
    const incomeCategory = {
      ...mockCategory,
      id: incomeCategoryId,
      type: 'income' as const,
    };

    vi.mocked(db.category.findFirst).mockResolvedValue(incomeCategory);
    vi.mocked(db.transaction.findFirst).mockResolvedValue(mockTransaction);

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ categoryId: incomeCategoryId }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('TYPE_MISMATCH');
  });

  it('should return 400 when changing type and categoryId with mismatch', async () => {
    const incomeCategoryId = '550e8400-e29b-41d4-a716-446655440050';
    const incomeCategory = {
      ...mockCategory,
      id: incomeCategoryId,
      type: 'income' as const,
    };

    vi.mocked(db.category.findFirst).mockResolvedValue(incomeCategory);

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({
          categoryId: incomeCategoryId,
          type: TxnType.expense,
        }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('TYPE_MISMATCH');
  });

  it('should return 400 when changing type without matching existing category', async () => {
    vi.mocked(db.transaction.findFirst).mockResolvedValue({
      ...mockTransaction,
      category: mockCategory,
    });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ type: TxnType.income }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('TYPE_MISMATCH');
  });

  it('should update multiple fields together', async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(mockCategory);
    vi.mocked(db.account.findFirst).mockResolvedValue(mockAccount);
    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(db.transaction.findFirst).mockResolvedValue({
      ...mockTransaction,
      amount: 200,
      note: 'Updated note',
      tags: ['tag1', 'tag2'],
      category: { name: 'Groceries', color: '#22c55e' },
      account: { name: 'Checking' },
    });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({
          amount: 200,
          note: 'Updated note',
          tags: ['tag1', 'tag2'],
        }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.amount).toBe(200);
    expect(data.data.note).toBe('Updated note');
    expect(data.data.tags).toEqual(['tag1', 'tag2']);
  });

  it('should allow clearing note field', async () => {
    vi.mocked(db.transaction.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(db.transaction.findFirst).mockResolvedValue({
      ...mockTransaction,
      note: null,
      category: { name: 'Groceries', color: '#22c55e' },
      account: { name: 'Checking' },
    });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ note: null }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.note).toBeNull();
  });

  it('should return 401 when unauthenticated', async () => {
    vi.mocked(requireApiAuth).mockResolvedValue({
      error: new Response(
        JSON.stringify({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        }),
        { status: 401 }
      ),
      user: null,
    });

    const req = new Request(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'PATCH',
        body: JSON.stringify({ amount: 150 }),
      }
    );

    const response = await PATCH(req, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});
