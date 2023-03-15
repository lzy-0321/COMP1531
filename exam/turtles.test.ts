import { Turtles, count_green, read_json } from './turtles';

const example_turtles = {
  Leonardo: {
    age: 15,
    color: ['blue']
  },
  Donatello: {
    age: 15,
    color: ['purple']
  },
  Raphael: {
    age: 10,
    color: []
  },
  Michelangelo: {
    age: 15,
    color: ['green']
  }
};

describe('dryrun', () => {
  test('count_green all examples', () => {
    expect(count_green(example_turtles)).toBe(1);
  });

  test('read all json files', () => {
    expect(read_json('turtles.json')).toStrictEqual(example_turtles);
  });
});

describe('test for count 0 green', () => {
  const read = read_json('turtles_test_green_0.json');
  test('count_green 0 examples', () => {
    expect(count_green(read)).toBe(0);
  });
});

describe('test for count 2 green', () => {
  const read = read_json('turtles_test_green_2.json');
  test('count_green 2 examples', () => {
    expect(count_green(read)).toBe(2);
  });
});
