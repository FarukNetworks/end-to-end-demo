import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to force re-evaluation
    vi.resetModules();
    // Clone the environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should parse valid environment variables', async () => {
    // Set up valid environment
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32);
    process.env.NODE_ENV = 'test';

    const { env } = await import('@/lib/env');

    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(env.NEXTAUTH_URL).toBe('http://localhost:3000');
    expect(env.NEXTAUTH_SECRET).toBe('a'.repeat(32));
    expect(env.NODE_ENV).toBe('test');
  });

  it('should transform feature flags from strings to booleans', async () => {
    // Set up valid environment with feature flags
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32);
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_BUDGETS = 'true';
    process.env.ENABLE_CSV_EXPORT = 'false';

    const { env } = await import('@/lib/env');

    expect(env.ENABLE_BUDGETS).toBe(true);
    expect(env.ENABLE_CSV_EXPORT).toBe(false);
    expect(env.ENABLE_RECURRING).toBe(false); // default
    expect(env.ENABLE_ATTACHMENTS).toBe(false); // default
  });

  it('should apply default values for missing feature flags', async () => {
    // Set up valid environment without feature flags
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32);
    process.env.NODE_ENV = 'test';

    const { env } = await import('@/lib/env');

    expect(env.ENABLE_BUDGETS).toBe(false);
    expect(env.ENABLE_CSV_EXPORT).toBe(false);
    expect(env.ENABLE_RECURRING).toBe(false);
    expect(env.ENABLE_ATTACHMENTS).toBe(false);
  });

  it('should throw error for invalid DATABASE_URL', async () => {
    process.env.DATABASE_URL = 'invalid-url';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32);
    process.env.NODE_ENV = 'test';

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow();
  });

  it('should throw error for short NEXTAUTH_SECRET', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'tooshort';
    process.env.NODE_ENV = 'test';

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow(/at least 32 characters/);
  });
});

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Set up valid environment
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32);
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should check if a feature is enabled', async () => {
    process.env.ENABLE_BUDGETS = 'true';

    const { isFeatureEnabled } = await import('@/lib/features');

    expect(isFeatureEnabled('budgets')).toBe(true);
    expect(isFeatureEnabled('csvExport')).toBe(false);
  });

  it('should get all enabled features', async () => {
    process.env.ENABLE_BUDGETS = 'true';
    process.env.ENABLE_CSV_EXPORT = 'true';

    const { getEnabledFeatures } = await import('@/lib/features');

    const enabled = getEnabledFeatures();
    expect(enabled).toContain('budgets');
    expect(enabled).toContain('csvExport');
    expect(enabled).not.toContain('recurring');
  });

  it('should check if all features are enabled', async () => {
    process.env.ENABLE_BUDGETS = 'true';
    process.env.ENABLE_CSV_EXPORT = 'true';

    const { areAllFeaturesEnabled } = await import('@/lib/features');

    expect(areAllFeaturesEnabled(['budgets', 'csvExport'])).toBe(true);
    expect(areAllFeaturesEnabled(['budgets', 'recurring'])).toBe(false);
  });

  it('should check if any feature is enabled', async () => {
    process.env.ENABLE_BUDGETS = 'true';

    const { isAnyFeatureEnabled } = await import('@/lib/features');

    expect(isAnyFeatureEnabled(['budgets', 'recurring'])).toBe(true);
    expect(isAnyFeatureEnabled(['recurring', 'attachments'])).toBe(false);
  });
});
