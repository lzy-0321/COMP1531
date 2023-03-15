import { factors } from './factors';

describe('dryrun', () => {
  test('example', () => {
    expect(factors(16)).toStrictEqual([2, 2, 2, 2]);
    expect(factors(24)).toStrictEqual([2, 2, 2, 3]);
    expect(factors(19)).toStrictEqual([19]);
  });
});
