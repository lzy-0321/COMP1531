import { checkPassword } from './password';

describe('dryrun', () => {
  test('example', () => {
    expect(checkPassword('something')).toEqual('Poor Password');
    expect(checkPassword('not a good test')).toEqual('Poor Password');
  });
});
