import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('bg-red-500', undefined, 'text-white')).toBe('bg-red-500 text-white');
    });
  });
});
