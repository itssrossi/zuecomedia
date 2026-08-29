import { describe, it, expect } from 'vitest';

describe('App sanity checks', () => {
  it('runs basic math correctly', () => {
    expect(2 + 2).toBe(4);
  });

  it('handles string comparisons', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('handles arrays correctly', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('handles objects correctly', () => {
    const user = { name: 'John-Ross', role: 'developer' };
    expect(user).toHaveProperty('name', 'John-Ross');
  });
});
