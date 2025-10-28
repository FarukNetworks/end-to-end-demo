import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { DELETE } from '@/app/api/transactions/[id]/route';
import { db } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth';

// Mock dependencies
vi.mock('@/lib/api-auth');
vi.mock('@/lib/db', () => ({
  db: {
    transaction: {
      deleteMany: vi.fn(),
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

describe('DELETE /api/transactions/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiAuth).mockResolvedValue({
      error: null,
      user: mockUser,
    });
  });

  it('should delete transaction and return 204', async () => {
    vi.mocked(db.transaction.deleteMany).mockResolvedValue({ count: 1 });

    const req = new NextRequest(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    expect(response.status).toBe(204);
    expect(db.transaction.deleteMany).toHaveBeenCalledWith({
      where: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      },
    });

    // Verify no response body for 204
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should return 404 for transaction belonging to different user', async () => {
    vi.mocked(db.transaction.deleteMany).mockResolvedValue({ count: 0 });

    const req = new NextRequest(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440099',
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440099' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('Transaction not found');
  });

  it('should return 404 for non-existent transaction ID', async () => {
    vi.mocked(db.transaction.deleteMany).mockResolvedValue({ count: 0 });

    const req = new NextRequest('http://localhost/api/transactions/non-existent-id', {
      method: 'DELETE',
    });

    const response = await DELETE(req, {
      params: Promise.resolve({ id: 'non-existent-id' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('Transaction not found');
  });

  it('should verify deleteMany is called with userId scoping', async () => {
    vi.mocked(db.transaction.deleteMany).mockResolvedValue({ count: 1 });

    const transactionId = '550e8400-e29b-41d4-a716-446655440000';
    const req = new NextRequest(`http://localhost/api/transactions/${transactionId}`, {
      method: 'DELETE',
    });

    await DELETE(req, { params: Promise.resolve({ id: transactionId }) });

    expect(db.transaction.deleteMany).toHaveBeenCalledWith({
      where: {
        id: transactionId,
        userId: mockUser.id,
      },
    });
  });

  it('should return 401 when unauthenticated', async () => {
    vi.mocked(requireApiAuth).mockResolvedValue({
      error: NextResponse.json(
        {
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      ),
      user: null,
    });

    const req = new NextRequest(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should handle internal errors gracefully', async () => {
    vi.mocked(db.transaction.deleteMany).mockRejectedValue(new Error('Database connection failed'));

    const req = new NextRequest(
      'http://localhost/api/transactions/550e8400-e29b-41d4-a716-446655440000',
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('Failed to delete transaction');
  });

  it('should successfully delete and verify transaction no longer exists', async () => {
    // First call: successful deletion
    vi.mocked(db.transaction.deleteMany).mockResolvedValueOnce({ count: 1 });
    // Second call: attempting to delete again should return count: 0
    vi.mocked(db.transaction.deleteMany).mockResolvedValueOnce({ count: 0 });

    const transactionId = '550e8400-e29b-41d4-a716-446655440000';
    const req1 = new NextRequest(`http://localhost/api/transactions/${transactionId}`, {
      method: 'DELETE',
    });

    // First deletion
    const response1 = await DELETE(req1, { params: Promise.resolve({ id: transactionId }) });
    expect(response1.status).toBe(204);

    // Attempt to delete same transaction again
    const req2 = new NextRequest(`http://localhost/api/transactions/${transactionId}`, {
      method: 'DELETE',
    });
    const response2 = await DELETE(req2, { params: Promise.resolve({ id: transactionId }) });
    const data2 = await response2.json();

    expect(response2.status).toBe(404);
    expect(data2.error.code).toBe('NOT_FOUND');
  });
});
