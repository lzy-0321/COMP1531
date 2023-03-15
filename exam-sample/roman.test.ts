import { roman } from './roman';

describe('dryrun', () => {
  test('example', () => {
    expect(roman("I")).toBe(1);
    expect(roman("MCMXCIV")).toBe(1994);
  });
});
