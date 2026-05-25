import { describe, it, expect } from 'vitest';

describe('cn utility', () => {
  it('merges class names correctly', async () => {
    const { cn } = await import('../utils/cn');
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('px-4', 'px-2')).toBe('px-2');
    expect(cn('text-red-500', undefined, false && 'hidden')).toBe('text-red-500');
  });
});
