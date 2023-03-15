import { reqClear } from './testWrappers';

describe('/clear/v1 test', () => {
  test('clears the database', () => {
    // the effects of clearing the database is checked in all the other
    // tests, here we only check the return value
    expect(reqClear()).toEqual({});
  });
});
