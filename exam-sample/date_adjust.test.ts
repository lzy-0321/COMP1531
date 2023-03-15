import { adjust } from './date_adjust';

describe('dryrun', () => {
  test('example', () => {
    expect(adjust(4, 4, '16:40 on 28 January 2021')).toBe('20:40 on 25 February 2021');
  });

  test('error week > 50', () => {
    expect(() => adjust(51, 4, '16:40 on 28 January 2021')).toThrowError('Too many weeks or hours');
  });

  test('error time > 50', () => {
    expect(() => adjust(4, 51, '16:40 on 28 January 2021')).toThrowError('Too many weeks or hours');
  });
});
