import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/health/route';

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

describe('Health Check Endpoint', () => {
  it('should return 200 with ok status when database is connected', async () => {
    const { db } = await import('@/lib/db');

    // Mock successful database query
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.db).toBe('connected');
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('should return 503 with error status when database connection fails', async () => {
    const { db } = await import('@/lib/db');

    // Mock database query failure
    vi.mocked(db.$queryRaw).mockRejectedValueOnce(new Error('Connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.db).toBe('disconnected');
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
  });
});
