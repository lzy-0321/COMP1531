import { makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import { reqChannelInvite, reqChannelJoin, reqChannelsCreate, reqChannelsList, reqChannelsListAll } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('channels/create/v2', () => {
  describe('success cases', () => {
    test('creating public channel', () => {
      const users = makeTestUsers();

      expect(reqChannelsCreate({
        token: users.token1,
        name: 'Hunter',
        isPublic: true
      })).toStrictEqual({
        channelId: expect.any(Number)
      });
    });

    test('creating private channel', () => {
      const users = makeTestUsers();

      expect(reqChannelsCreate({
        token: users.token1,
        name: 'Hunter',
        isPublic: false
      })).toStrictEqual({
        channelId: expect.any(Number)
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      makeTestUsers();

      expect(reqChannelsCreate({
        token: makeInvalidToken(),
        name: 'Hunter1',
        isPublic: true
      })).toStrictEqual(403);
    });

    test('short name', () => {
      const users = makeTestUsers();

      expect(reqChannelsCreate({
        token: users.token1,
        name: '',
        isPublic: true
      })).toStrictEqual(400);
    });

    test('long name', () => {
      const users = makeTestUsers();

      expect(reqChannelsCreate({
        token: users.token1,
        name: Array(21).fill('a').join(''),
        isPublic: true
      })).toStrictEqual(400);
    });
  });
});

describe('/channels/list/v2 test', () => {
  describe('success cases', () => {
    test('listing when owner', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqChannelsCreate({
        token: users.token2,
        name: 'channel 2',
        isPublic: true
      });

      expect(reqChannelsList({
        token: users.token1
      })).toStrictEqual({
        channels: [{
          channelId: channelId,
          name: 'channel 1'
        }]
      });
    });

    test('listing when not owner', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqChannelJoin({
        token: users.token2,
        channelId: channelId
      });

      expect(reqChannelsList({
        token: users.token2
      })).toStrictEqual({
        channels: [{
          channelId: channelId,
          name: 'channel 1'
        }]
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      reqChannelsCreate({
        token: users.token1,
        name: 'Hunter',
        isPublic: true
      });

      expect(reqChannelsList({
        token: makeInvalidToken()
      })).toStrictEqual(403);
    });
  });
});

describe('channels/listAll/v2', () => {
  describe('success cases', () => {
    test('user is not in any channel', () => {
      const users = makeTestUsers();

      expect(reqChannelsListAll({
        token: users.token1
      })).toStrictEqual({
        channels: []
      });
    });

    test('user is in (and owns) one public channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelsListAll({
        token: users.token1
      })).toStrictEqual({
        channels: [{
          channelId: channel.channelId,
          name: 'channel 1'
        }]
      });
    });

    test('user is in (and owns) one private channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: false
      });

      expect(reqChannelsListAll({
        token: users.token1
      })).toStrictEqual({
        channels: [{
          channelId: channel.channelId,
          name: 'channel 1'
        }]
      });
    });

    test('user owns multiple channels', () => {
      const users = makeTestUsers();

      const channel1 = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      const channel2 = reqChannelsCreate({
        token: users.token1,
        name: 'channel 2',
        isPublic: true
      });
      const channel3 = reqChannelsCreate({
        token: users.token1,
        name: 'channel 3',
        isPublic: false
      });

      expect(reqChannelsListAll({
        token: users.token1
      })).toStrictEqual({
        channels: [{
          channelId: channel1.channelId,
          name: 'channel 1'
        },
        {
          channelId: channel2.channelId,
          name: 'channel 2'
        },
        {
          channelId: channel3.channelId,
          name: 'channel 3'
        }]
      });
    });

    test('user is invited to a channel', () => {
      const users = makeTestUsers();

      const channel1 = reqChannelsCreate({
        token: users.token2,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelInvite({
        token: users.token2,
        channelId: channel1.channelId,
        uId: users.uId1
      });

      expect(reqChannelsListAll({
        token: users.token1
      })).toStrictEqual({
        channels: [{
          channelId: channel1.channelId,
          name: 'channel 1'
        }]
      });
    });

    test('user is in multiple channels', () => {
      const users = makeTestUsers();

      const channel1 = reqChannelsCreate({
        token: users.token2,
        name: 'channel 1',
        isPublic: true
      });
      const channel2 = reqChannelsCreate({
        token: users.token1,
        name: 'channel 2',
        isPublic: false
      });
      const channel3 = reqChannelsCreate({
        token: users.token2,
        name: 'channel 3',
        isPublic: true
      });

      reqChannelInvite({
        token: users.token2,
        channelId: channel1.channelId,
        uId: users.uId1
      });
      reqChannelJoin({
        token: users.token1,
        channelId: channel3.channelId,
      });

      const result = reqChannelsListAll({
        token: users.token1
      });
      result.channels = new Set(result.channels);

      expect(result).toStrictEqual({
        channels: new Set([{
          channelId: channel1.channelId,
          name: 'channel 1'
        },
        {
          channelId: channel2.channelId,
          name: 'channel 2'
        },
        {
          channelId: channel3.channelId,
          name: 'channel 3'
        }])
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      makeTestUsers();

      expect(reqChannelsListAll({
        token: makeInvalidToken()
      })).toStrictEqual(403);
    });
  });
});
