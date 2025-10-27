import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  beforeEach(() => {
    // Mock console methods
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.debug = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  });

  describe('info', () => {
    it('should log structured JSON with info level', () => {
      logger.info('Test message', { userId: '12345' });

      expect(console.log).toHaveBeenCalledOnce();
      const logOutput = (console.log as any).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Test message');
      expect(parsed.userId).toBe('12345');
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('warn', () => {
    it('should log structured JSON with warn level', () => {
      logger.warn('Warning message');

      expect(console.warn).toHaveBeenCalledOnce();
      const logOutput = (console.warn as any).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('Warning message');
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('error', () => {
    it('should log structured JSON with error details', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { context: 'test' });

      expect(console.error).toHaveBeenCalledOnce();
      const logOutput = (console.error as any).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error occurred');
      expect(parsed.error).toBe('Test error');
      expect(parsed.stack).toBeDefined();
      expect(parsed.context).toBe('test');
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('apiRequest', () => {
    it('should log API request with PII filtering', () => {
      logger.apiRequest({
        method: 'GET',
        route: '/api/users',
        userId: 'user-12345678-full-id',
        statusCode: 200,
        duration: 150,
      });

      expect(console.log).toHaveBeenCalledOnce();
      const logOutput = (console.log as any).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('API Request');
      expect(parsed.method).toBe('GET');
      expect(parsed.route).toBe('/api/users');
      expect(parsed.statusCode).toBe(200);
      expect(parsed.duration).toBe(150);

      // Verify PII filtering - userId should be masked
      expect(parsed.userId).toBe('user_user-123');
      expect(parsed.userId).not.toBe('user-12345678-full-id');
    });

    it('should handle missing userId', () => {
      logger.apiRequest({
        method: 'POST',
        route: '/api/login',
        statusCode: 401,
        duration: 50,
      });

      expect(console.log).toHaveBeenCalledOnce();
      const logOutput = (console.log as any).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.userId).toBeUndefined();
    });
  });

  describe('debug', () => {
    it('should log in development mode', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.debug('Debug message');

      expect(console.debug).toHaveBeenCalledOnce();
      const logOutput = (console.debug as any).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('debug');
      expect(parsed.message).toBe('Debug message');
    });

    it('should not log in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.debug('Debug message');

      expect(console.debug).not.toHaveBeenCalled();
    });
  });
});
