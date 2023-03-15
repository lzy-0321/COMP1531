import { makeTestUsers, resetTestState } from './testUtil';
import { reqAuthLogin, reqAuthPasswordResetRequest, reqAuthPasswordResetReset, reqUserProfile } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('auth/passwordReset/request/v1', () => {
  describe('success cases', () => {
    test('simple success', () => {
      makeTestUsers();
      expect(reqAuthPasswordResetRequest({
        email: 'user1@example.com'
      })).toStrictEqual({});
    });

    test('email not register', () => {
      makeTestUsers();
      expect(reqAuthPasswordResetRequest({
        email: 'not.a.user@example.com'
      })).toStrictEqual({});
    });

    test('tokens are invalidated', () => {
      const users = makeTestUsers();

      const otherUser = users.uId2;

      const { token: anotherToken } = reqAuthLogin({
        email: 'user1@example.com',
        password: 'password1'
      });

      // Check both tokens are valid
      expect(reqUserProfile({
        token: users.token1, uId: otherUser
      })).toStrictEqual(expect.any(Object));
      expect(reqUserProfile({
        token: anotherToken, uId: otherUser
      })).toStrictEqual(expect.any(Object));

      expect(reqAuthPasswordResetRequest({
        email: 'user1@example.com'
      })).toStrictEqual({});

      // Check both tokens are invalid
      expect(reqUserProfile({
        token: users.token1, uId: otherUser
      })).toStrictEqual(403);
      expect(reqUserProfile({
        token: anotherToken, uId: otherUser
      })).toStrictEqual(403);
    });
  });
});

describe('auth/passwordReset/reset/v1', () => {
  describe('error cases', () => {
    test('short password', () => {
      expect(reqAuthPasswordResetReset({
        resetCode: '<random>',
        newPassword: '12345'
      })).toStrictEqual(400);
    });

    test('invalid reset code', () => {
      expect(reqAuthPasswordResetReset({
        resetCode: '<random>',
        newPassword: '123456'
      })).toStrictEqual(400);
    });
  });
});
