import { holidaysInRange } from './holidays';

test('error test for holidaysInRange', () => {
  expect(holidaysInRange(324, 1570)).toStrictEqual([]);
});

test('error test for holidaysInRange', () => {
  expect(holidaysInRange(1571, 1570)).toStrictEqual([]);
});

test('correct test for holidaysInRange', () => {
  expect(holidaysInRange(1565, 1570)).toStrictEqual([
    {
      valentinesDay: 'Sunday, 14.02.1565',
      easter: 'Sunday, 28.03.1565',
      christmas: 'Saturday, 25.12.1565'
    },
    {
      valentinesDay: 'Monday, 14.02.1566',
      easter: 'Sunday, 17.04.1566',
      christmas: 'Sunday, 25.12.1566'
    },
    {
      valentinesDay: 'Tuesday, 14.02.1567',
      easter: 'Sunday, 09.04.1567',
      christmas: 'Monday, 25.12.1567'
    },
    {
      valentinesDay: 'Wednesday, 14.02.1568',
      easter: 'Sunday, 24.03.1568',
      christmas: 'Wednesday, 25.12.1568'
    },
    {
      valentinesDay: 'Friday, 14.02.1569',
      easter: 'Sunday, 13.04.1569',
      christmas: 'Thursday, 25.12.1569'
    },
    {
      valentinesDay: 'Saturday, 14.02.1570',
      easter: 'Sunday, 05.04.1570',
      christmas: 'Friday, 25.12.1570'
    },
  ]);
});
