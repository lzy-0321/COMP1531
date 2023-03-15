import { makeInvalidId, makeInvalidToken, makeTestUsers, resetTestState, unixTimeNow } from './testUtil';
import { reqChannelMessages, reqChannelsCreate, reqDmCreate, reqDmMessages, reqDmRemove, reqMessageSendLater, reqMessageSendLaterDM } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('message/sendlater/v1', () => {
  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqMessageSendLater({
        token: makeInvalidToken(), channelId, message: 'hi', timeSent: unixTimeNow() + 2
      })).toStrictEqual(403);
    });

    test('sender not memeber of channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqMessageSendLater({
        token: users.tokenGlobalOwner, channelId, message: 'hi', timeSent: unixTimeNow() + 2
      })).toStrictEqual(403);
    });

    test('time in past', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqMessageSendLater({
        token: users.token1, channelId, message: 'hi', timeSent: unixTimeNow() - 5
      })).toStrictEqual(400);
    });

    test('invalid channel id', () => {
      const users = makeTestUsers();
      reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqMessageSendLater({
        token: users.token1, channelId: makeInvalidId(), message: 'hi', timeSent: unixTimeNow() + 3
      })).toStrictEqual(400);
    });

    test('short message', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqMessageSendLater({
        token: users.token1, channelId, message: '', timeSent: unixTimeNow() + 3
      })).toStrictEqual(400);
    });

    test('long message', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      expect(reqMessageSendLater({
        token: users.token1, channelId, message: 'a'.repeat(1001), timeSent: unixTimeNow() + 3
      })).toStrictEqual(400);
    });

    describe('success', () => {
      test('sending later, then listing', async () => {
        const users = makeTestUsers();

        const { channelId } = reqChannelsCreate({
          token: users.token1, name: 'channel 1', isPublic: true
        });

        const res1 = reqMessageSendLater({
          token: users.token1, channelId, message: 'hi future!', timeSent: unixTimeNow() + 20
        });
        expect(res1).toStrictEqual({
          messageId: expect.any(Number)
        });

        const timeSent = unixTimeNow() + 2;
        const res2 = reqMessageSendLater({
          token: users.token1, channelId, message: 'hi future!', timeSent
        });
        expect(res2).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([]);

        await new Promise(resolve => {
          setTimeout(resolve, 3500);
        });

        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          messageId: res2.messageId,
          uId: users.uId1,
          message: 'hi future!',
          timeSent,
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      }, 7500);

      test('simple success', async () => {
        const users = makeTestUsers();

        const { channelId } = reqChannelsCreate({
          token: users.token1, name: 'channel 1', isPublic: true
        });

        expect(reqMessageSendLater({
          token: users.token1, channelId, message: 'hi future 1!', timeSent: unixTimeNow() + 50
        })).toStrictEqual({
          messageId: expect.any(Number)
        });
        expect(reqMessageSendLater({
          token: users.token1, channelId, message: 'hi future 2!', timeSent: unixTimeNow() + 100
        })).toStrictEqual({
          messageId: expect.any(Number)
        });
        expect(reqMessageSendLater({
          token: users.token1, channelId, message: 'hi future 3!', timeSent: unixTimeNow() + 2
        })).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([]);
      });
    });
  });
});

describe('message/sendlaterdm/v1', () => {
  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqMessageSendLaterDM({
        token: makeInvalidToken(), dmId, message: 'hi', timeSent: unixTimeNow() + 2
      })).toStrictEqual(403);
    });

    test('sender not memeber of channel', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqMessageSendLaterDM({
        token: users.token3, dmId, message: 'hi', timeSent: unixTimeNow() + 2
      })).toStrictEqual(403);
    });

    test('time in past', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqMessageSendLaterDM({
        token: users.token1, dmId, message: 'hi', timeSent: unixTimeNow() - 5
      })).toStrictEqual(400);
    });

    test('invalid dm id', () => {
      const users = makeTestUsers();
      reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqMessageSendLaterDM({
        token: users.token1, dmId: makeInvalidId(), message: 'hi', timeSent: unixTimeNow() + 3
      })).toStrictEqual(400);
    });

    test('short message', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqMessageSendLaterDM({
        token: users.token1, dmId, message: '', timeSent: unixTimeNow() + 3
      })).toStrictEqual(400);
    });

    test('long message', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      expect(reqMessageSendLaterDM({
        token: users.token1, dmId, message: 'a'.repeat(1001), timeSent: unixTimeNow() + 3
      })).toStrictEqual(400);
    });

    describe('success', () => {
      test('sending later, then listing', async () => {
        const users = makeTestUsers();

        const { dmId } = reqDmCreate({
          token: users.token1, uIds: [users.uId2]
        });

        const res1 = reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future!', timeSent: unixTimeNow() + 20
        });
        expect(res1).toStrictEqual({
          messageId: expect.any(Number)
        });

        const timeSent = unixTimeNow() + 2;
        const res2 = reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future!', timeSent
        });
        expect(res2).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(reqDmMessages({
          token: users.token1, dmId, start: 0
        }).messages).toStrictEqual([]);

        await new Promise(resolve => {
          setTimeout(resolve, 4300);
        });

        expect(reqDmMessages({
          token: users.token1, dmId, start: 0
        }).messages).toStrictEqual([{
          messageId: res2.messageId,
          uId: users.uId1,
          message: 'hi future!',
          timeSent,
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      }, 7500);

      test('sending later, then removing', async () => {
        const users = makeTestUsers();

        const { dmId } = reqDmCreate({
          token: users.token1, uIds: [users.uId2]
        });

        const res1 = reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future 1!', timeSent: unixTimeNow() + 20
        });
        expect(res1).toStrictEqual({
          messageId: expect.any(Number)
        });
        const timeSent = unixTimeNow() + 2;
        const res2 = reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future 2!', timeSent
        });
        expect(res2).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(reqDmMessages({
          token: users.token1, dmId, start: 0
        }).messages).toStrictEqual([]);

        expect(reqDmRemove({
          token: users.token1, dmId
        })).toStrictEqual({});

        await new Promise(resolve => {
          setTimeout(resolve, 4300);
        });
      }, 7500);

      test('simple success', async () => {
        const users = makeTestUsers();

        const { dmId } = reqDmCreate({
          token: users.token1, uIds: [users.uId2]
        });

        expect(reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future 1!', timeSent: unixTimeNow() + 50
        })).toStrictEqual({
          messageId: expect.any(Number)
        });
        expect(reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future 2!', timeSent: unixTimeNow() + 100
        })).toStrictEqual({
          messageId: expect.any(Number)
        });
        expect(reqMessageSendLaterDM({
          token: users.token1, dmId, message: 'hi future 3!', timeSent: unixTimeNow() + 2
        })).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(reqDmMessages({
          token: users.token1, dmId, start: 0
        }).messages).toStrictEqual([]);
      });
    });
  });
});
