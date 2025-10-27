import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});
