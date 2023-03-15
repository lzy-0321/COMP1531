import { makeInvalidId, makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import {
  reqUserProfile, reqUserProfileSetEmail, reqUserProfileSetHandle, reqUserProfileSetName,
  reqUserStats, reqChannelsCreate, reqChannelInvite, reqChannelJoin,
  reqChannelLeave, reqMessageSend, reqDmCreate, reqDmRemove,
  reqDmLeave, reqMessageSendDM, reqMessageRemove
} from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('user/profile/v2', () => {
  describe('success case', () => {
    test('looking at profile of self', () => {
      const users = makeTestUsers();
      const response = reqUserProfile({ token: users.token1, uId: users.uId1 });

      expect(response).toStrictEqual({
        user: {
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: 'F1',
          nameLast: 'L1',
          handleStr: 'f1l1',
          profileImgUrl: expect.any(String),
        }
      });
    });

    test('looking at profile of other', () => {
      const users = makeTestUsers();
      const response = reqUserProfile({ token: users.token1, uId: users.uId2 });

      expect(response).toStrictEqual({
        user: {
          uId: users.uId2,
          email: 'user2@example.com',
          nameFirst: 'F2',
          nameLast: 'L2',
          handleStr: 'f2l2',
          profileImgUrl: expect.any(String),
        }
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const token = makeInvalidToken();
      const response = reqUserProfile({ token, uId: users.uId1 });
      expect(response).toStrictEqual(403);
    });

    test('invalid uId', () => {
      const users = makeTestUsers();
      const response = reqUserProfile({ token: users.token1, uId: makeInvalidId() });
      expect(response).toStrictEqual(400);
    });
  });
});

describe('/user/profile/setname/v1 test', () => {
  describe('success case', () => {
    test('success', () => {
      const users = makeTestUsers();
      reqUserProfileSetName({ token: users.token1, nameFirst: 'first', nameLast: 'last' });
      const response = reqUserProfile({ token: users.token1, uId: users.uId1 });
      expect(response).toStrictEqual({
        user: {
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: 'first',
          nameLast: 'last',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      makeTestUsers();
      const token = makeInvalidToken();
      const response = reqUserProfileSetName({ token, nameFirst: 'first', nameLast: 'last' });
      expect(response).toStrictEqual(403);
    });

    test('invalid nameFirst', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetName({ token: users.token1, nameFirst: 'first'.repeat(20), nameLast: 'last' });
      expect(response).toStrictEqual(400);
    });

    test('invalid nameLast', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetName({ token: users.token1, nameFirst: 'first', nameLast: 'last'.repeat(20) });
      expect(response).toStrictEqual(400);
    });

    test('nameFirst too short', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetName({ token: users.token1, nameFirst: '', nameLast: 'last' });
      expect(response).toStrictEqual(400);
    });

    test('nameLast too short', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetName({ token: users.token1, nameFirst: 'first', nameLast: '' });
      expect(response).toStrictEqual(400);
    });
  });
});

describe('/user/profile/setemail/v1', () => {
  describe('success cases', () => {
    test('changing email', () => {
      const users = makeTestUsers();
      reqUserProfileSetEmail({ token: users.token1, email: 'a@different.email.com' });
      const response = reqUserProfile({ token: users.token1, uId: users.uId1 });
      expect(response).toStrictEqual({
        user: {
          uId: users.uId1,
          email: 'a@different.email.com',
          nameFirst: 'F1',
          nameLast: 'L1',
          handleStr: 'f1l1',
          profileImgUrl: expect.any(String),
        }
      });
    });

    test('leaving email the same', () => {
      const users = makeTestUsers();
      reqUserProfileSetEmail({ token: users.token1, email: 'user1@exampe.com' });
      const response = reqUserProfile({ token: users.token1, uId: users.uId1 });
      expect(response).toStrictEqual({
        user: {
          uId: users.uId1,
          email: 'user1@exampe.com',
          nameFirst: 'F1',
          nameLast: 'L1',
          handleStr: 'f1l1',
          profileImgUrl: expect.any(String),
        }
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      makeTestUsers();
      const token = makeInvalidToken();
      const response = reqUserProfileSetEmail({ token: token, email: 'valid1@example.com' });
      expect(response).toStrictEqual(403);
    });

    test('invalid email', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetEmail({ token: users.token1, email: 'invaliemail.example.com' });
      expect(response).toStrictEqual(400);
    });

    test('email has been used', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetEmail({ token: users.token3, email: 'user2@example.com' });
      expect(response).toStrictEqual(400);
    });
  });
});

describe('user/profile/sethandle/v1 test', () => {
  describe('success case', () => {
    test('success', () => {
      const users = makeTestUsers();
      reqUserProfileSetHandle({ token: users.token1, handleStr: 'handle1' });
      const response = reqUserProfile({ token: users.token1, uId: users.uId1 });
      expect(response).toStrictEqual({
        user: {
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: 'F1',
          nameLast: 'L1',
          handleStr: 'handle1',
          profileImgUrl: expect.any(String),
        }
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      makeTestUsers();
      const token = makeInvalidToken();
      const response = reqUserProfileSetHandle({ token: token, handleStr: 'handle' });
      expect(response).toStrictEqual(403);
    });

    test('handleStr contains characters that are not alphanumeric', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetHandle({ token: users.token1, handleStr: 'handle!' });
      expect(response).toStrictEqual(400);
    });

    test('handleStr too short', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetHandle({ token: users.token1, handleStr: 'ha' });
      expect(response).toStrictEqual(400);
    });

    test('handleStr too long', () => {
      const users = makeTestUsers();
      const response = reqUserProfileSetHandle({ token: users.token1, handleStr: 'handle'.repeat(10) });
      expect(response).toStrictEqual(400);
    });

    test('handleStr has been used', () => {
      const users = makeTestUsers();
      reqUserProfileSetHandle({ token: users.token1, handleStr: 'handle1' });
      const response = reqUserProfileSetHandle({ token: users.token2, handleStr: 'handle1' });
      expect(response).toStrictEqual(400);
    });
  });
});

describe('/user/stats/v1 test', () => {
  describe('success case', () => {
    test('for channel and channel msgs', () => {
      const users = makeTestUsers();

      const channel1 = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      const channel2 = reqChannelsCreate({
        token: users.token2,
        name: 'channel 2',
        isPublic: true
      });

      reqMessageSend({
        token: users.token1,
        channelId: channel1.channelId,
        message: 'message 1'
      });

      reqChannelJoin({
        token: users.token1,
        channelId: channel2.channelId,
      });

      reqChannelLeave({
        token: users.token1,
        channelId: channel2.channelId
      });

      reqChannelInvite({
        token: users.token2,
        channelId: channel2.channelId,
        uId: users.uId1,
      });

      reqMessageSend({
        token: users.token1,
        channelId: channel2.channelId,
        message: 'message 2'
      });

      const response = reqUserStats({ token: users.token1 });

      expect(response).toStrictEqual({
        userStats: {
          channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }, { numChannelsJoined: 2, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }, { numChannelsJoined: 2, timeStamp: expect.any(Number) }],
          dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }, { numMessagesSent: 2, timeStamp: expect.any(Number) }],
          involvementRate: expect.any(Number),
        }
      });
    });

    test('for dm and msgs', () => {
      const users = makeTestUsers();

      const dm1 = reqDmCreate({
        token: users.token1,
        uIds: [users.uId2],
      });

      const dm2 = reqDmCreate({
        token: users.token3,
        uIds: [users.uId1],
      });

      reqMessageSendDM({
        token: users.token1,
        dmId: dm1.dmId,
        message: 'message 1'
      });

      reqMessageSendDM({
        token: users.token1,
        dmId: dm2.dmId,
        message: 'message 2'
      });

      reqDmLeave({
        token: users.token1,
        dmId: dm1.dmId
      });

      reqDmRemove({
        token: users.token3,
        dmId: dm2.dmId,
      });

      const channel1 = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqMessageSend({
        token: users.token1,
        channelId: channel1.channelId,
        message: 'message 1'
      });

      const response = reqUserStats({ token: users.token1 });

      expect(response).toStrictEqual({
        userStats: {
          channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
          dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }, { numDmsJoined: 2, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }, { numDmsJoined: 0, timeStamp: expect.any(Number) }],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }, { numMessagesSent: 2, timeStamp: expect.any(Number) }, { numMessagesSent: 3, timeStamp: expect.any(Number) }],
          involvementRate: expect.any(Number),
        }
      });
    });

    test('for zero channl, dm, message', () => {
      const users = makeTestUsers();

      const dm1 = reqDmCreate({
        token: users.token1,
        uIds: [users.uId2],
      });

      reqDmRemove({
        token: users.token1,
        dmId: dm1.dmId,
      });

      const response = reqUserStats({ token: users.token1 });

      expect(response).toStrictEqual({
        userStats: {
          channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
          dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }, { numDmsJoined: 0, timeStamp: expect.any(Number) }],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
          involvementRate: 0,
        }
      });
    });

    test('for involvementRate > 1', () => {
      const users = makeTestUsers();

      const dm1 = reqDmCreate({
        token: users.token1,
        uIds: [users.uId2],
      });

      const message = reqMessageSendDM({
        token: users.token1,
        dmId: dm1.dmId,
        message: 'message 1'
      });

      reqMessageRemove({
        token: users.token1,
        messageId: message.messageId,
      });

      const response = reqUserStats({ token: users.token1 });

      expect(response).toStrictEqual({
        userStats: {
          channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
          dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }],
          involvementRate: 1,
        }
      });
    });
  });

  describe('fail case', () => {
    test('invalid token', () => {
      const response = reqUserStats({ token: makeInvalidToken() });
      expect(response).toStrictEqual(403);
    });
  });
});
