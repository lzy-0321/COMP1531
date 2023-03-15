import { makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import { reqAuthLogin, reqAuthLogout, reqAuthRegister, reqUserProfile } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('auth/login/v2', () => {
  describe('error cases', () => {
    test('wrong email', () => {
      makeTestUsers();

      expect(reqAuthLogin({
        email: 'user7@example.com',
        password: 'password1'
      })).toStrictEqual(400);
    });

    test('wrong password', () => {
      makeTestUsers();

      expect(reqAuthLogin({
        email: 'user1@example.com',
        password: 'password2'
      })).toStrictEqual(400);
    });
  });

  describe('success cases', () => {
    test('successful login', () => {
      const users = makeTestUsers();

      const userId = users.uId2;

      expect(reqAuthLogin({
        email: 'user2@example.com',
        password: 'password2'
      })).toStrictEqual({
        token: expect.any(String),
        authUserId: userId
      });
    });

    test('multiple logins', () => {
      const users = makeTestUsers();

      const user1 = users.uId1;
      const user2 = users.uId2;

      const login1 = reqAuthLogin({
        email: 'user2@example.com',
        password: 'password2'
      });
      const login2 = reqAuthLogin({
        email: 'user2@example.com',
        password: 'password2'
      });
      const login3 = reqAuthLogin({
        email: 'user1@example.com',
        password: 'password1'
      });

      expect(login1).toStrictEqual({
        token: expect.any(String),
        authUserId: user2
      });
      expect(login2).toStrictEqual({
        token: expect.any(String),
        authUserId: user2
      });
      expect(login3).toStrictEqual({
        token: expect.any(String),
        authUserId: user1
      });
      expect(login1.token !== login2.token);
      expect(login2.token !== login3.token);
      expect(login3.token !== login1.token);
    });
  });
});

describe('/auth/register/v2 test', () => {
  describe('success cases', () => {
    test('Test Success /auth/register/v2', () => {
      const response = reqAuthRegister({
        email: 'valid@example.com', password: '1234567', nameFirst: 'Brad', nameLast: 'Valid'
      });
      expect(response).toStrictEqual({
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
    });
    test('Test unique autherUserId', () => {
      const firstUser = reqAuthRegister({
        email: 'valid@example.com', password: 'Hunger7', nameFirst: 'Brad', nameLast: 'Valid'
      });
      const secondUser = reqAuthRegister({
        email: 'valid2@example.com', password: 'Hunter6', nameFirst: 'Gary', nameLast: 'Jeff'
      });
      expect(firstUser.authUserId).not.toEqual(secondUser.authUserId);
    });
    test('unique handle generation', () => {
      reqAuthRegister({
        email: 'valid1@example.com', password: 'hunter2', nameFirst: 'a b', nameLast: 'c!d1'
      });
      reqAuthRegister({
        email: 'valid2@example.com', password: 'hunter2', nameFirst: 'ab', nameLast: 'cd10'
      });
      const { authUserId, token } = reqAuthRegister({
        email: 'valid3@example.com', password: 'hunter2', nameFirst: '#a#b#', nameLast: '#c#d#1#'
      });

      expect(reqUserProfile({ token, uId: authUserId })).toStrictEqual({
        user: {
          uId: authUserId,
          email: 'valid3@example.com',
          nameFirst: '#a#b#',
          nameLast: '#c#d#1#',
          handleStr: 'abcd11',
          profileImgUrl: expect.any(String),
        }
      });
    });
  });

  describe('error cases', () => {
    test('Invalid email', () => {
      expect(reqAuthRegister({
        email: 'invaliemail.example.com', password: 'hunter2', nameFirst: 'Brad', nameLast: 'Invalid'
      })).toEqual(400);
    });

    test('Duplicate email', () => {
      reqAuthRegister({
        email: 'valid@example.com', password: 'Hunger7', nameFirst: 'Brad', nameLast: 'Valid'
      });
      expect(reqAuthRegister({
        email: 'valid@example.com', password: 'Hunter3', nameFirst: 'Clive', nameLast: 'Default'
      })).toEqual(400);
    });

    test('Short password', () => {
      expect(reqAuthRegister({
        email: 'valid@example.com', password: '12345', nameFirst: 'Brad', nameLast: 'Invalid'
      })).toEqual(400);
    });

    test('Short first name', () => {
      expect(reqAuthRegister({
        email: 'valid@example.com', password: 'Hunter3', nameFirst: '', nameLast: 'Invalid'
      })).toEqual(400);
    });

    test('Long first name', () => {
      expect(reqAuthRegister({
        email: 'valid@example.com', password: 'Hunter3', nameFirst: new Array(51).fill('a').join(''), nameLast: 'Invalid'
      })).toEqual(400);
    });

    test('Short last name', () => {
      expect(reqAuthRegister({
        email: 'valid@example.com', password: 'Hunter3', nameFirst: 'Brad', nameLast: ''
      })).toEqual(400);
    });

    test('Long last name', () => {
      expect(reqAuthRegister({
        email: 'valid@example.com', password: 'Hunter3', nameFirst: 'Brad', nameLast: new Array(51).fill('a').join('')
      })).toEqual(400);
    });
  });
});

describe('/auth/logout/v1 test', () => {
  describe('success cases', () => {
    test('Test Success /auth/logout/v1', () => {
      const users = makeTestUsers();
      const response = reqAuthLogout({ token: users.token1 });
      expect(response).toStrictEqual({});
    });
  });

  describe('error cases', () => {
    test('double logout error', () => {
      const users = makeTestUsers();
      let response = reqAuthLogout({ token: users.token1 });
      expect(response).toStrictEqual({});
      response = reqAuthLogout({ token: users.token1 });
      expect(response).toStrictEqual(403);
    });

    test('invalid token', () => {
      makeTestUsers();
      const response = reqAuthLogout({ token: makeInvalidToken() });
      expect(response).toStrictEqual(403);
    });
  });
});
