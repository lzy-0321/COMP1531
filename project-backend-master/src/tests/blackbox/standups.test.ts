import { makeInvalidId, makeTestUsers, resetTestState, unixTimeNow } from './testUtil';
import { reqChannelJoin, reqChannelMessages, reqChannelsCreate, reqMessageSend, reqStandupActive, reqStandupSend, reqStandupStart } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('/standup/start/v1', () => {
  describe('success case', () => {
    test('successful standup creation', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      const timeNow = unixTimeNow();
      const res = reqStandupStart({
        token: users.token1, channelId, length: 50
      });
      expect(res).toStrictEqual({
        timeFinish: expect.any(Number)
      });
      expect(res.timeFinish).toBeLessThanOrEqual(timeNow + 53);
      expect(res.timeFinish).toBeGreaterThanOrEqual(timeNow + 47);
    });

    test('standup with no messages', async () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      const { timeFinish } = reqStandupStart({
        token: users.token1, channelId, length: 1
      });
      expect(timeFinish).toStrictEqual(expect.any(Number));

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      })).toStrictEqual({
        messages: [],
        start: 0,
        end: -1
      });
    }, 3500);
  });

  describe('error cases', () => {
    test('invalid chanenl id', () => {
      const users = makeTestUsers();
      reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqStandupStart({
        token: users.token1, channelId: makeInvalidId(), length: 20
      })).toStrictEqual(400);
    });

    test('negative length', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqStandupStart({
        token: users.token1, channelId, length: -1
      })).toStrictEqual(400);
    });

    test('already have active standup', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqStandupStart({
        token: users.token1, channelId, length: 30
      })).toStrictEqual({
        timeFinish: expect.any(Number)
      });

      expect(reqStandupStart({
        token: users.token1, channelId, length: 40
      })).toStrictEqual(400);
    });

    test('user not member of channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqStandupStart({
        token: users.token2, channelId, length: 30
      })).toStrictEqual(403);
    });
  });
});

describe('standup/active/v1', () => {
  describe('success cases', () => {
    test('no active standups', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqStandupActive({
        token: users.token1, channelId
      })).toStrictEqual({
        isActive: false, timeFinish: null
      });
    });

    test('active standup', async () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      const { timeFinish } = reqStandupStart({
        token: users.token1, channelId, length: 3
      });

      expect(reqStandupActive({
        token: users.token1, channelId
      })).toStrictEqual({
        timeFinish, isActive: true
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(reqStandupActive({
        token: users.token1, channelId
      })).toStrictEqual({
        timeFinish, isActive: true
      });

      await new Promise(resolve => setTimeout(resolve, 2200));

      expect(reqStandupActive({
        token: users.token1, channelId
      })).toStrictEqual({
        timeFinish: null, isActive: false
      });
    }, 6500);
  });

  describe('error cases', () => {
    test('invalid channel id', () => {
      const users = makeTestUsers();
      reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqStandupActive({
        token: users.token1, channelId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('user not member of channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqStandupActive({
        token: users.token2, channelId
      })).toStrictEqual(403);
    });
  });
});

describe('standup/send/v1', () => {
  describe('success cases', () => {
    test('basic success', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqStandupStart({
        token: users.token1, channelId, length: 3
      });
      expect(reqStandupSend({
        token: users.token1, channelId, message: 'hi'
      })).toStrictEqual({});
    });

    test('success followed by messing appearing', async () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      const { timeFinish } = reqStandupStart({
        token: users.token1, channelId, length: 3
      });
      expect(timeFinish).toStrictEqual(expect.any(Number));

      expect(reqStandupSend({
        token: users.token1, channelId, message: 'msg 1'
      })).toStrictEqual({});

      reqChannelJoin({ token: users.token2, channelId });

      expect(reqStandupSend({
        token: users.token2, channelId, message: 'msg 2'
      })).toStrictEqual({});

      await new Promise(resolve => setTimeout(resolve, 1000));

      reqMessageSend({
        token: users.token2, channelId, message: 'normal channel msg'
      });

      expect(reqChannelMessages({
        token: users.token2, channelId, start: 0
      })).toStrictEqual({
        messages: [{
          messageId: expect.any(Number),
          uId: users.uId2,
          message: 'normal channel msg',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }],
        start: 0,
        end: -1
      });

      expect(reqStandupSend({
        token: users.token1, channelId, message: ''
      })).toStrictEqual({});
      expect(reqStandupSend({
        token: users.token1, channelId, message: 'msg 4'
      })).toStrictEqual({});

      await new Promise(resolve => setTimeout(resolve, 2200));

      expect(reqChannelMessages({
        token: users.token2, channelId, start: 0
      })).toStrictEqual({
        messages: [{
          messageId: expect.any(Number),
          uId: users.uId1,
          message: 'f1l1: msg 1\nf2l2: msg 2\nf1l1: \nf1l1: msg 4',
          timeSent: timeFinish,
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }, {
          messageId: expect.any(Number),
          uId: users.uId2,
          message: 'normal channel msg',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }],
        start: 0,
        end: -1
      });
    }, 6500);
  });

  describe('error cases', () => {
    test('long message', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqStandupStart({
        token: users.token1, channelId, length: 3
      });
      expect(reqStandupSend({
        token: users.token1, channelId, message: 'a'.repeat(1001)
      })).toStrictEqual(400);
    });

    test('invalid channel id', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqStandupStart({
        token: users.token1, channelId, length: 3
      });
      expect(reqStandupSend({
        token: users.token1, channelId: makeInvalidId(), message: 'hi'
      })).toStrictEqual(400);
    });

    test('no active standup', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqStandupSend({
        token: users.token1, channelId, message: 'hi'
      })).toStrictEqual(400);
    });

    test('not member of channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqStandupStart({
        token: users.token1, channelId, length: 3
      });
      expect(reqStandupSend({
        token: users.token2, channelId, message: 'hi'
      })).toStrictEqual(403);
    });
  });
});
