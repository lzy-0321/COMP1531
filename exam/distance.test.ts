import { longest_distance } from './distance';

describe('dryrun', () => {
  test('example', () => {
    expect(longest_distance([1, 2, 3, 1, 4])).toBe(3);
  });

  test('no two elements are equal', () => {
    expect(longest_distance([1, 2, 3, 4])).toBe(0);
  });
});
