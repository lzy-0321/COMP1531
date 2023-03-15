import { makeInvalidToken, makeTestUsers, resetTestState, simpleRegisterUser } from './testUtil';
import {
  reqUsersAll, reqUsersStats, reqChannelsCreate, reqChannelInvite,
  reqChannelJoin, reqChannelLeave, reqMessageSend, reqDmCreate,
  reqDmRemove, reqDmLeave, reqMessageSendDM, reqMessageRemove
} from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('users/all/v1', () => {
  describe('success cases', () => {
    test('only one user', () => {
      const user = simpleRegisterUser();
      const result = reqUsersAll({ token: user.token });
      expect(result).toStrictEqual({
        users: [{
          uId: user.authUserId,
          email: 'user0@example.com',
          nameFirst: 'F0',
          nameLast: 'L0',
          handleStr: 'f0l0',
          profileImgUrl: expect.any(String),
        }]
      });
    });

    test('multiple users', () => {
      const user0 = simpleRegisterUser();
      const user1 = simpleRegisterUser();
      const user2 = simpleRegisterUser();
      const result = reqUsersAll({ token: user1.token });
      expect(result).toStrictEqual({
        users: expect.any(Array)
      });
      expect(new Set(result.users)).toStrictEqual(new Set([{
        uId: user0.authUserId,
        email: 'user0@example.com',
        nameFirst: 'F0',
        nameLast: 'L0',
        handleStr: 'f0l0',
        profileImgUrl: expect.any(String),
      }, {
        uId: user2.authUserId,
        email: 'user2@example.com',
        nameFirst: 'F2',
        nameLast: 'L2',
        handleStr: 'f2l2',
        profileImgUrl: expect.any(String),
      }, {
        uId: user1.authUserId,
        email: 'user1@example.com',
        nameFirst: 'F1',
        nameLast: 'L1',
        handleStr: 'f1l1',
        profileImgUrl: expect.any(String),
      }]));
    });
  });

  describe('error cases', () => {
    test('Test invalid token', () => {
      makeTestUsers();
      const token = makeInvalidToken();
      const result = reqUsersAll({ token });
      expect(result).toStrictEqual(403);
    });
  });
});

describe('users/stats/v1', () => {
  describe('success cases', () => {
    test('for channel and msgs', () => {
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

      const message = reqMessageSend({
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

      reqMessageRemove({
        token: users.token1,
        messageId: message.messageId,
      });

      const response = reqUsersStats({ token: users.token1 });
      expect(response).toStrictEqual({
        workspaceStats: {
          channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }, { numChannelsExist: 1, timeStamp: expect.any(Number) }, { numChannelsExist: 2, timeStamp: expect.any(Number) }],
          dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }],
          messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }, { numMessagesExist: 2, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }],
          utilizationRate: expect.any(Number),
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

      reqMessageSendDM({
        token: users.token2,
        dmId: dm1.dmId,
        message: 'message 3'
      });

      const response = reqUsersStats({ token: users.token1 });
      expect(response).toStrictEqual({
        workspaceStats: {
          channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }],
          dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }, { numDmsExist: 1, timeStamp: expect.any(Number) }, { numDmsExist: 2, timeStamp: expect.any(Number) }, { numDmsExist: 1, timeStamp: expect.any(Number) }],
          messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }, { numMessagesExist: 2, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }, { numMessagesExist: 2, timeStamp: expect.any(Number) }],
          utilizationRate: expect.any(Number),
        }
      });
    });
  });

  describe('fail cases', () => {
    test('Test invalid token', () => {
      const response = reqUsersStats({ token: makeInvalidToken() });
      expect(response).toStrictEqual(403);
    });
  });
});
