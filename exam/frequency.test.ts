import { frequency_get } from './frequency';

describe('dryrun', () => {
  test('example', () => {
    expect(
      frequency_get(
        `I like you
        I really, really, like you!
        Yes I really do`
      )
    ).toStrictEqual({
      I: 3,
      REALLY: 3,
      LIKE: 2,
      YOU: 2,
      YES: 1,
      DO: 1
    });
  });

  test('the string is empty', () => {
    expect(frequency_get('')).toStrictEqual({});
  });

  test('the string is whitespace', () => {
    expect(frequency_get(' ')).toStrictEqual({});
  });

  test('the string is punctuation', () => {
    expect(frequency_get('!')).toStrictEqual({});
  });
});
