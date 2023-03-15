import { construct_object } from './objects';

describe('dryrun', () => {
  test('example', () => {
    const l1 = ['a', 'b', 'c'];
    const l2 = [1, 2, 3];
    expect(construct_object(l1, l2)).toStrictEqual({ a: 1, b: 2, c: 3 });
  });

  test('two keys are the same', () => {
    const l1 = ['a', 'b', 'c', 'b'];
    const l2 = [1, 2, 3, 4];
    expect(construct_object(l1, l2)).toStrictEqual({ a: 1, b: 4, c: 3 });
  });

  test('empty', () => {
    const l1 = [];
    const l2 = [];
    expect(construct_object(l1, l2)).toStrictEqual({});
  });

  test('different lengths', () => {
    const l1 = ['a', 'b', 'c'];
    const l2 = [1, 2];
    expect(construct_object(l1, l2)).toStrictEqual({});
  });

  test('different lengths', () => {
    const l1 = ['a', 'b'];
    const l2 = [1, 2, 3];
    expect(construct_object(l1, l2)).toStrictEqual({});
  });
});
