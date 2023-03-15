import { makeInvalidId, makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import { reqAuthRegister, reqDmCreate, reqDmDetails, reqDmLeave, reqDmList, reqDmRemove } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('dm/details/v1', () => {
  describe('success cases', () => {
    test('basic success', () => {
      const { token: token1, authUserId: uId1 } = reqAuthRegister({
        email: 'valid1@example.com',
        nameFirst: 'a1',
        nameLast: 'b2',
        password: 'passsowrd'
      });
      const { authUserId: uId2 } = reqAuthRegister({
        email: 'valid2@example.com',
        nameFirst: 'b1',
        nameLast: 'a1',
        password: 'passsowrd'
      });
      const { token: token3, authUserId: uId3 } = reqAuthRegister({
        email: 'valid3@example.com',
        nameFirst: 'a1',
        nameLast: 'b2',
        password: 'passsowrd'
      });

      const dm = reqDmCreate({
        token: token1, uIds: [uId2, uId3]
      }).dmId;
      const mainResult = reqDmDetails({ token: token3, dmId: dm });
      expect(mainResult).toStrictEqual({
        name: 'a1b2, a1b20, b1a1',
        members: expect.any(Array)
      });

      expect(new Set(mainResult.members)).toEqual(new Set([
        {
          uId: uId2,
          email: 'valid2@example.com',
          nameFirst: 'b1',
          nameLast: 'a1',
          handleStr: 'b1a1',
          profileImgUrl: expect.any(String),
        },
        {
          uId: uId3,
          email: 'valid3@example.com',
          nameFirst: 'a1',
          nameLast: 'b2',
          handleStr: 'a1b20',
          profileImgUrl: expect.any(String),
        },
        {
          uId: uId1,
          email: 'valid1@example.com',
          nameFirst: 'a1',
          nameLast: 'b2',
          handleStr: 'a1b2',
          profileImgUrl: expect.any(String),
        },
      ]));
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({ token: users.token1, uIds: [] });
      expect(reqDmDetails({
        token: makeInvalidToken(), dmId
      })).toStrictEqual(403);
    });

    test('invalid id', () => {
      const users = makeTestUsers();
      reqDmCreate({ token: users.token1, uIds: [] });
      expect(reqDmDetails({
        token: users.token1, dmId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('not member', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqDmDetails({
        token: users.token3, dmId: dmId
      })).toStrictEqual(403);
    });
  });
});

describe('dm/remove/v2', () => {
  describe('success cases', () => {
    test('succesful listing, then removal, then listing', () => {
      const users = makeTestUsers();

      const dm1 = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      }).dmId;
      const dm2 = reqDmCreate({
        token: users.token1, uIds: []
      }).dmId;
      expect([dm1, dm2]).toStrictEqual([expect.any(Number), expect.any(Number)]);

      expect(reqDmList({ token: users.token1 })).toStrictEqual({
        dms: expect.any(Array)
      });
      expect(new Set(reqDmList({ token: users.token1 }).dms)).toStrictEqual(new Set([
        { dmId: dm1, name: 'f1l1, f2l2' },
        { dmId: dm2, name: 'f1l1' },
      ]));

      expect(reqDmList({ token: users.token2 })).toStrictEqual({
        dms: expect.any(Array)
      });
      expect(new Set(reqDmList({ token: users.token2 }).dms)).toStrictEqual(new Set([
        { dmId: dm1, name: 'f1l1, f2l2' },
      ]));

      expect(reqDmRemove({ token: users.token2, dmId: dm1 })).toStrictEqual(403);
      expect(reqDmRemove({ token: users.token1, dmId: dm1 })).toStrictEqual({});

      expect(new Set(reqDmList({
        token: users.token2
      }).dms)).toStrictEqual(new Set([]));
    });

    test('leave then try to remove', () => {
      const users = makeTestUsers();
      const dm = reqDmCreate({ token: users.token1, uIds: [] });

      expect(reqDmLeave({
        token: users.token1,
        dmId: dm.dmId
      })).toEqual({});

      expect(reqDmRemove({ token: users.token1, dmId: dm.dmId })).toStrictEqual(403);
    });
  });

  describe('error cases', () => {
    test('invalid DM id', () => {
      const users = makeTestUsers();
      reqDmCreate({ token: users.token1, uIds: [] });

      expect(reqDmRemove({
        token: users.token1, dmId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('invalid token', () => {
      const users = makeTestUsers();
      const dm = reqDmCreate({ token: users.token1, uIds: [] });

      expect(reqDmRemove({
        token: makeInvalidToken(), dmId: dm.dmId
      })).toStrictEqual(403);
    });

    test('dm list with invalid token', () => {
      makeTestUsers();
      expect(reqDmList({ token: makeInvalidToken() })).toStrictEqual(403);
    });
  });
});

describe('dm/create/v1', () => {
  describe('success cases', () => {
    test('empty dm', () => {
      const users = makeTestUsers();

      expect(reqDmCreate({
        token: users.token1, uIds: []
      })).toStrictEqual({
        dmId: expect.any(Number)
      });
    });

    test('multiple empty dms have unique ID\'s', () => {
      const users = makeTestUsers();

      const dm1 = reqDmCreate({
        token: users.token1, uIds: []
      });
      const dm2 = reqDmCreate({
        token: users.token1, uIds: []
      });

      expect([dm1, dm2]).toStrictEqual([
        { dmId: expect.any(Number) }, { dmId: expect.any(Number) }
      ]);
      expect(dm1.dmId).not.toEqual(dm2.dmId);
    });

    test('successful creation of non-empty DM', () => {
      const users = makeTestUsers();

      expect(reqDmCreate({
        token: users.token1,
        uIds: [
          users.uId2,
          users.uId3
        ]
      })).toEqual({
        dmId: expect.any(Number)
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      makeTestUsers();

      expect(reqDmCreate({
        token: makeInvalidToken(), uIds: []
      })).toEqual(403);
    });

    test('invalid uids', () => {
      const users = makeTestUsers();

      expect(reqDmCreate({
        token: users.token1,
        uIds: [users.uId2, makeInvalidId()]
      })).toEqual(400);
    });

    test('duplicate uids', () => {
      const users = makeTestUsers();

      expect(reqDmCreate({
        token: users.token1,
        uIds: [
          users.uId2,
          users.uId3,
          users.uId2
        ]
      })).toEqual(400);
    });
  });
});

describe('dm/leave/v1', () => {
  describe('success cases', () => {
    test('test success dm leave', () => {
      const users = makeTestUsers();
      const dm = reqDmCreate({ token: users.token1, uIds: [] });

      expect(reqDmLeave({
        token: users.token1,
        dmId: dm.dmId
      })).toEqual({});
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      const { dmId: dm1 } = reqDmCreate({ token: users.token1, uIds: [] });

      expect(reqDmLeave({
        token: makeInvalidToken(),
        dmId: dm1
      })).toEqual(403);
    });

    test('dm does not exist', () => {
      const users = makeTestUsers();
      reqDmCreate({ token: users.token1, uIds: [] });

      expect(reqDmLeave({
        token: users.token1, dmId: makeInvalidId()
      })).toEqual(400);
    });

    test('leaving dm twice', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({ token: users.token1, uIds: [users.uId2] });

      expect(reqDmLeave({
        token: users.token1,
        dmId: dmId
      })).toStrictEqual({});
      expect(reqDmLeave({
        token: users.token1,
        dmId: dmId
      })).toEqual(403);
    });
  });
});
