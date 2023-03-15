import { timetable } from './timetable';

describe('dryrun', () => {
  test('example', () => {
    expect(timetable(
      [new Date(2019, 9, 27), new Date(2019, 9, 30)],
      [[14, 10], [10, 30]])
    ).toStrictEqual([
      new Date(2019, 9, 27, 10, 30),
      new Date(2019, 9, 27, 14, 10),
      new Date(2019, 9, 30, 10, 30),
      new Date(2019, 9, 30, 14, 10),
    ])
  });
});
