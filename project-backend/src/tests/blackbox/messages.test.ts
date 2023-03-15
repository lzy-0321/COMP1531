import { makeInvalidId, makeInvalidToken, makeTestUsers, resetTestState, unixTimeNow } from './testUtil';
import {
  reqChannelInvite, reqChannelJoin, reqChannelMessages,
  reqChannelsCreate, reqDmCreate, reqDmMessages,
  reqDmRemove, reqMessageEdit, reqMessagePin, reqMessageRemove, reqMessageSend,
  reqMessageSendDM, reqMessageShare, reqMessageUnpin, reqSearch, reqNotificationsGet, reqMessageReact
} from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

interface ReceivedMessage {
  messageId: number, uId: number, message: string, timeSent: number
}
type MessageArray = Array<ReceivedMessage>;

/**
 * Check if two arrays are equa;
 */
const expectMessageArraysEqual = (received: MessageArray, expected: MessageArray) => {
  expect(received.length === expected.length);
  expect(received).toStrictEqual(expected.map(msg => {
    return {
      messageId: msg.messageId,
      uId: msg.uId,
      message: msg.message,
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }]
    };
  }));

  for (const i in received) {
    const receivedTimeSent = received[i].timeSent;
    const expectedTimeSent = expected[i].timeSent;
    expect(receivedTimeSent).toBeGreaterThanOrEqual(expectedTimeSent - 3);
    expect(receivedTimeSent).toBeLessThanOrEqual(expectedTimeSent + 3);
  }
};

/**
 * Make a channel with token `token` and then run
 */
const makeChannelAndInvite = (token: string, otherUsers: number[], name: string) => {
  const { channelId } = reqChannelsCreate({ token, name, isPublic: true });
  otherUsers.forEach((uId: number) => {
    reqChannelInvite({ token, channelId, uId });
  });
  return channelId;
};

const performCommonMessageTests = (
  makeVenue: (token: string) => number,
  sendMessage: (
    token: string, venueId: number, message: string
  ) => { messageId: number},
  makeMultiUserVenue: typeof makeChannelAndInvite,
  listMessages: (
    token: string, venueId: number, start: number
  ) => ReturnType<typeof reqChannelMessages>
) => {
  describe('error cases for sending and listing', () => {
    describe('invalid message size handling', () => {
      test('message too short', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(users.token1, channel, '')).toStrictEqual(400);
      });

      test('message too long', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(
          users.token1, channel, Array(1001).fill('a').join('')
        )).toStrictEqual(400);
      });
    });

    describe('sending authorisation and id\'s', () => {
      test('authorised user not member, public channel', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(users.token2, channel, 'hi')).toStrictEqual(403);
      });

      test('authorised user not member, private channel', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(users.token2, channel, 'hi')).toStrictEqual(403);
      });

      test('invalid channel', () => {
        const users = makeTestUsers();
        makeVenue(users.token1);
        makeVenue(users.token2);

        expect(sendMessage(
          users.token1, makeInvalidId(), 'hi'
        )).toStrictEqual(400);
      });

      test('invalid token', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(
          makeInvalidToken(), channel, 'hi'
        )).toStrictEqual(403);
      });
    });

    describe('listing error cases', () => {
      test('invalid channelId', () => {
        const users = makeTestUsers();
        makeVenue(users.token1);

        expect(listMessages(users.token1, makeInvalidId(), 0)).toEqual(400);
      });

      test('invalid authUserId', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(listMessages(makeInvalidToken(), channel, 0)).toEqual(403);
      });

      test('start too big', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(listMessages(users.token1, channel, 1)).toEqual(400);
      });

      test('user not authorised', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token2);

        expect(listMessages(users.token1, channel, 0)).toEqual(403);
      });
    });
  });

  describe('simple sending and listing', () => {
    describe('simple message send successs', () => {
      test('just short enough message', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(
          users.token1, channel, Array(1000).fill('a').join('')
        )).toStrictEqual({
          messageId: expect.any(Number)
        });
      });

      test('just long enough message', () => {
        const users = makeTestUsers();
        const channel = makeVenue(users.token1);

        expect(sendMessage(
          users.token1, channel, 'a'
        )).toStrictEqual({
          messageId: expect.any(Number)
        });
      });

      test('send in multiple channels', () => {
        const users = makeTestUsers();
        const channel1 = makeVenue(users.token1);
        const channel2 = makeVenue(users.token2);
        const channel3 = makeVenue(users.token3);

        expect(sendMessage(
          users.token1, channel1, 'hi'
        )).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(sendMessage(
          users.token2, channel2, 'hi'
        )).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(sendMessage(
          users.token3, channel3, 'hi'
        )).toStrictEqual({
          messageId: expect.any(Number)
        });

        expect(sendMessage(
          users.token1, channel3, 'hi'
        )).toStrictEqual(403);
      });
    });

    test('listing with no messages', () => {
      const users = makeTestUsers();
      const channel = makeVenue(users.token1);

      expect(listMessages(users.token1, channel, 0)).toEqual({
        messages: [],
        start: 0,
        end: -1
      });
    });

    test('sending + listing messages - 110 msgs', () => {
      const users = makeTestUsers();

      makeVenue(users.token1);
      const channel = makeMultiUserVenue(
        users.token1, [users.uId2], 'channel test 2'
      );
      makeVenue(users.token2);

      const allMessages = Array(110).fill(null).map((v, i) => {
        const isUser1 = i % 4 === 1;

        return {
          messageId: -1,
          uId: isUser1 ? users.uId1 : users.uId2,
          token: isUser1 ? users.token1 : users.token2,
          message: `this is a msg! #${i}`,
          timeSent: -1
        };
      });

      // no messages yet
      expect(listMessages(users.token1, channel, 0)).toStrictEqual({
        messages: [], start: 0, end: -1
      });
      expect(listMessages(users.token2, channel, 0)).toStrictEqual({
        messages: [], start: 0, end: -1
      });

      for (const message of [...allMessages].reverse()) {
        const messageResult = sendMessage(
          message.token, channel, message.message
        );
        message.timeSent = unixTimeNow();
        expect(messageResult).toStrictEqual({
          messageId: expect.any(Number)
        });

        message.messageId = messageResult.messageId;
      }

      const messagesFrom0 = listMessages(users.token1, channel, 0);
      expect(messagesFrom0).toStrictEqual({
        start: 0, end: 50, messages: expect.any(Array)
      });
      expectMessageArraysEqual(messagesFrom0.messages, allMessages.slice(0, 50));

      const messagesFrom10 = listMessages(users.token1, channel, 10);
      expect(messagesFrom10).toStrictEqual({
        start: 10, end: 60, messages: expect.any(Array)
      });
      expectMessageArraysEqual(messagesFrom10.messages, allMessages.slice(10, 60));

      expectMessageArraysEqual(
        listMessages(users.token1, channel, 45).messages, allMessages.slice(45, 45 + 50)
      );

      const messagesFrom59 = listMessages(users.token1, channel, 59);
      expect(messagesFrom59).toStrictEqual({
        start: 59, end: 109, messages: expect.any(Array)
      });
      expectMessageArraysEqual(messagesFrom59.messages, allMessages.slice(59, 109));

      const messagesFrom60 = listMessages(users.token1, channel, 60);
      expect(messagesFrom60).toStrictEqual({
        start: 60, end: -1, messages: expect.any(Array)
      });
      expectMessageArraysEqual(messagesFrom60.messages, allMessages.slice(60));

      const messagesFrom80 = listMessages(users.token1, channel, 80);
      expect(messagesFrom80).toStrictEqual({
        start: 80, end: -1, messages: expect.any(Array)
      });
      expectMessageArraysEqual(messagesFrom80.messages, allMessages.slice(80));

      const messagesFrom110 = listMessages(users.token1, channel, 110);
      expect(messagesFrom110).toStrictEqual({
        start: 110, end: -1, messages: []
      });
      expectMessageArraysEqual(messagesFrom110.messages, allMessages.slice(110));

      const messagesFrom111 = listMessages(users.token1, channel, 111);
      expect(messagesFrom111).toStrictEqual(400);
    });
  });
};

describe('sending and receiving DM messages', () => {
  performCommonMessageTests(token => {
    return reqDmCreate({ token, uIds: [] }).dmId;
  }, (token, dmId, message) => {
    return reqMessageSendDM({ token, dmId, message });
  }, (token, uIds, name) => {
    return reqDmCreate({ token, uIds }).dmId;
  }, (token, dmId, start) => {
    return reqDmMessages({ token, dmId, start });
  });
});

describe('sending and receiving channel messages', () => {
  performCommonMessageTests(token => {
    return reqChannelsCreate({ token, name: 'channel', isPublic: true }).channelId;
  }, (token, channelId, message) => {
    return reqMessageSend({ token, channelId, message });
  }, makeChannelAndInvite, (token, channelId, start) => {
    return reqChannelMessages({ token, channelId, start });
  });
});

describe('/message/remove/v1', () => {
  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const channelMessage = reqMessageSend({
        token: users.token1, channelId, message: 'message in channel'
      });
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      const dmMessage = reqMessageSendDM({
        token: users.token1, dmId, message: 'message in dm'
      });

      expect(reqMessageRemove({
        token: makeInvalidToken(),
        messageId: channelMessage
      })).toStrictEqual(403);
      expect(reqMessageRemove({
        token: makeInvalidToken(),
        messageId: dmMessage
      })).toStrictEqual(403);
    });

    test('user attempts to delete a message that does not exist', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqMessageSend({ token: users.token1, channelId, message: 'message 1' });
      reqMessageSend({ token: users.token1, channelId, message: 'message 2' });

      expect(reqMessageRemove({
        token: users.token1,
        messageId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('user attempts to delete a message they did not send', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqChannelJoin({ token: users.token2, channelId });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageRemove({
        token: users.token2, messageId
      })).toStrictEqual(403);
    });

    test('deleting in removed dm', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: []
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 1'
      });
      reqDmRemove({
        token: users.token1, dmId
      });
      expect(reqMessageRemove({
        token: users.token1, messageId
      })).toStrictEqual(400);
    });
  });

  describe('success - removal of messages in channels', () => {
    test('owner deleting messages', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqChannelJoin({ token: users.token2, channelId });
      const { messageId } = reqMessageSend({
        token: users.token2, channelId, message: 'message 1'
      });

      expect(reqMessageRemove({
        token: users.token1, messageId
      })).toStrictEqual({});
    });

    test('global owner deleting messages', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelInvite({
        token: users.token1, channelId, uId: users.uId2
      });
      const { messageId } = reqMessageSend({
        token: users.token2, channelId, message: 'message 1'
      });

      expect(reqMessageRemove({
        token: users.tokenGlobalOwner,
        messageId
      })).toStrictEqual(400);
      reqChannelJoin({ token: users.tokenGlobalOwner, channelId });

      expect(reqMessageRemove({
        token: users.tokenGlobalOwner,
        messageId
      })).toStrictEqual({});
    });

    test('successful message removal', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      const { messageId: message1 } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      const { messageId: message2 } = reqMessageSend({
        token: users.token1, channelId, message: 'message 2'
      });
      expect(reqMessageRemove({
        token: users.token1,
        messageId: message1
      })).toStrictEqual({});

      // check that the message is actually gone
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      })).toStrictEqual({
        messages: [{
          message: 'message 2',
          messageId: message2,
          uId: users.uId1,
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
    });
  });

  describe('removal of messages in dms', () => {
    test('successful message removal', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({ token: users.token1, uIds: [users.uId2] });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 1'
      });
      expect(reqMessageRemove({
        token: users.token1,
        messageId
      })).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      })).toStrictEqual({
        start: 0, end: -1, messages: []
      });
    });
  });

  describe('removal of messages in both dms and channels', () => {
    test('successful removal of multiple messages', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      reqChannelJoin({ token: users.token2, channelId });

      const { messageId: message1 } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      const { messageId: message2 } = reqMessageSend({
        token: users.token2, channelId, message: 'message 2'
      });

      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2, users.uId3]
      });
      const { messageId: message3 } = reqMessageSendDM({
        token: users.token3, dmId, message: 'message 3'
      });
      const { messageId: message4 } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 4'
      });

      expect(reqMessageRemove({
        token: users.token1,
        messageId: message2
      })).toStrictEqual({});

      expect(reqMessageRemove({
        token: users.token1,
        messageId: message4
      })).toStrictEqual({});

      expect(reqMessageRemove({
        token: users.token3,
        messageId: message3
      })).toStrictEqual({});

      expect(reqMessageRemove({
        token: users.token1,
        messageId: message1
      })).toStrictEqual({});
    });
  });
});

describe('/message/edit/v1', () => {
  describe('success cases', () => {
    test('succesfully edit message in channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageEdit({
        token: users.token1, messageId, message: 'updated message'
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'updated message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('succesfully edit message in dm', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2, users.uId3]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'old message'
      });
      const result = reqMessageEdit({
        token: users.token1, messageId: messageId, message: 'new message'
      });

      expect(result).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'new message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('succesfully edit message in channel', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageEdit({
        token: users.token1, messageId, message: 'updated message'
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'updated message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);

      expect(reqMessageEdit({
        token: users.token1, messageId, message: 'here we go again'
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'here we go again',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('success message deleted', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageEdit({
        token: users.token1, messageId, message: ''
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([]);
    });

    test('user is the channel owner', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqChannelJoin({
        token: users.token2, channelId
      });
      const { messageId } = reqMessageSend({
        token: users.token2, channelId, message: 'original message'
      });

      expect(reqMessageEdit({
        token: users.token1, messageId, message: 'new message'
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'new message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId2,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('user is the global owner', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      reqChannelJoin({
        token: users.token2, channelId
      });
      const { messageId } = reqMessageSend({
        token: users.token2, channelId, message: 'original message'
      });
      reqChannelJoin({
        token: users.tokenGlobalOwner, channelId
      });

      expect(reqMessageEdit({
        token: users.tokenGlobalOwner, messageId, message: 'new message'
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'new message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId2,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });
  });

  describe('error cases', () => {
    test('attempting to edit a deleted message', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageRemove({
        token: users.token1,
        messageId
      })).toStrictEqual({});

      expect(reqMessageEdit({
        token: users.token1, messageId, message: 'updated'
      })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([]);
    });

    test('message over 1000 characters', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'original message'
      });

      expect(reqMessageEdit({
        token: users.token1, messageId, message: 'a'.repeat(1001)
      })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'original message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('messageId invalid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'original message'
      });

      expect(reqMessageEdit({
        token: users.token1, messageId: makeInvalidId(), message: 'new message'
      })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'original message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('user is not an authorised user of the channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'original message'
      });

      expect(reqMessageEdit({
        token: users.token2, messageId, message: 'new message'
      })).toStrictEqual(403);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'original message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('user is not the sender nor owner', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'original message'
      });
      reqChannelJoin({
        token: users.token2, channelId
      });

      expect(reqMessageEdit({
        token: users.token2, messageId, message: 'new message'
      })).toStrictEqual(403);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'original message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('token invalid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'original message'
      });

      expect(reqMessageEdit({
        token: makeInvalidToken(), messageId, message: 'new message'
      })).toStrictEqual(403);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'original message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });
  });
});

describe('/message/pin/v1', () => {
  describe('success cases', () => {
    test('succesfully pin message in channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessagePin({
        token: users.token1, messageId
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('succesfully pin message in dm', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2, users.uId3]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      const result = reqMessagePin({
        token: users.token1, messageId
      });

      expect(result).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });
  });

  describe('error cases', () => {
    test('messageId invalid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 3'
      });

      expect(reqMessagePin({
        token: users.token1, messageId: makeInvalidId()
      })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 3',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('message already pinned in dm', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2, users.uId3]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      const result = reqMessagePin({
        token: users.token1, messageId
      });
      const result1 = reqMessagePin({
        token: users.token1, messageId
      });

      expect(result).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);

      expect(result1).toStrictEqual(400);
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('message already pinned in channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessagePin({
        token: users.token1, messageId
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
      expect(reqMessagePin({
        token: users.token1, messageId
      })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('user is not the sender nor owner', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'original message'
      });
      reqChannelJoin({
        token: users.token2, channelId
      });

      expect(reqMessagePin({
        token: users.token2, messageId
      })).toStrictEqual(403);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'original message',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    test('token invalid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessagePin({
        token: makeInvalidToken(), messageId
      })).toStrictEqual(403);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });
  });
});

describe('/message/unpin/v1', () => {
  describe('success cases', () => {
    test('succesfully unpin message in channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessagePin({
        token: users.token1, messageId
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
      expect(reqMessageUnpin({
        token: users.token1, messageId
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });
    test('succesfully unpin message in dm', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2, users.uId3]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      const result = reqMessagePin({
        token: users.token1, messageId
      });
      expect(result).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: true,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
      const result1 = reqMessageUnpin({
        token: users.token1, messageId
      });
      expect(result1).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      }]);
    });

    describe('error cases', () => {
      test('messageId invalid', () => {
        const users = makeTestUsers();
        const { channelId } = reqChannelsCreate({
          token: users.token1, name: 'channel 1', isPublic: false
        });
        const { messageId } = reqMessageSend({
          token: users.token1, channelId, message: 'message 1'
        });

        expect(reqMessagePin({
          token: users.token1, messageId
        })).toStrictEqual({});
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: true,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
        expect(reqMessageUnpin({
          token: users.token1, messageId: makeInvalidId()
        })).toStrictEqual(400);
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: true,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      });

      test('message not already pinned in channel', () => {
        const users = makeTestUsers();
        const { channelId } = reqChannelsCreate({
          token: users.token1, name: 'channel 1', isPublic: false
        });
        const { messageId } = reqMessageSend({
          token: users.token1, channelId, message: 'message 1'
        });
        expect(reqMessageUnpin({
          token: users.token1, messageId
        })).toStrictEqual(400);
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      });
      test('message not already pinned in dm', () => {
        const users = makeTestUsers();
        const { dmId } = reqDmCreate({
          token: users.token1, uIds: [users.uId2, users.uId3]
        });
        const { messageId } = reqMessageSendDM({
          token: users.token1, dmId, message: 'message 2'
        });
        const result1 = reqMessageUnpin({
          token: users.token1, messageId
        });
        expect(result1).toStrictEqual(400);
        expect(reqDmMessages({
          token: users.token2, dmId, start: 0
        }).messages).toStrictEqual([{
          message: 'message 2',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      });

      test('user is not the sender nor owner', () => {
        const users = makeTestUsers();
        const { channelId } = reqChannelsCreate({
          token: users.token1, name: 'channel 1', isPublic: true
        });
        const { messageId } = reqMessageSend({
          token: users.token1, channelId, message: 'original message'
        });

        expect(reqMessagePin({
          token: users.token1, messageId
        })).toStrictEqual({});
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'original message',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: true,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);

        reqChannelJoin({
          token: users.token2, channelId
        });

        expect(reqMessageUnpin({
          token: users.token2, messageId
        })).toStrictEqual(403);
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'original message',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: true,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      });

      test('token invalid', () => {
        const users = makeTestUsers();
        const { channelId } = reqChannelsCreate({
          token: users.token1, name: 'channel 1', isPublic: false
        });
        const { messageId } = reqMessageSend({
          token: users.token1, channelId, message: 'original message'
        });
        expect(reqMessagePin({
          token: users.token1, messageId
        })).toStrictEqual({});
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'original message',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: true,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
        expect(reqMessageUnpin({
          token: makeInvalidToken(), messageId
        })).toStrictEqual(403);
        expect(reqChannelMessages({
          token: users.token1, channelId, start: 0
        }).messages).toStrictEqual([{
          message: 'original message',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          isPinned: true,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        }]);
      });
    });
  });
});

describe('/search/v1', () => {
  describe('success cases', () => {
    test('no messages match the query', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      reqMessageSend({
        token: users.token1, channelId, message: 'message 2'
      });

      expect(reqSearch({
        token: users.token1, queryStr: 'not a message'
      })).toStrictEqual({ messages: [] });
    });

    test('1 message matches the query', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      reqMessageSend({
        token: users.token1, channelId, message: 'message 2'
      });

      expect(reqSearch({
        token: users.token1, queryStr: '1'
      })).toStrictEqual({
        messages: [{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        }]
      });
    });

    test('multiple messages match the query', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      const message2 = reqMessageSend({
        token: users.token1, channelId, message: 'message 2'
      });
      const message3 = reqMessageSend({
        token: users.token1, channelId, message: 'message 3'
      });

      expect(reqSearch({
        token: users.token1, queryStr: 'message'
      })).toStrictEqual({
        messages: [{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        },
        {
          message: 'message 2',
          messageId: message2.messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        },
        {
          message: 'message 3',
          messageId: message3.messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        }]
      });
    });

    test('multiple messages from different users match the query', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelInvite({
        token: users.token1, channelId: channelId, uId: users.uId2
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      const message2 = reqMessageSend({
        token: users.token2, channelId, message: 'message 2'
      });

      expect(reqSearch({
        token: users.token1, queryStr: 'message'
      })).toStrictEqual({
        messages: [{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        },
        {
          message: 'message 2',
          messageId: message2.messageId,
          timeSent: expect.any(Number),
          uId: users.uId2,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        }]
      });
    });

    test('multiple messages from different dms and channels match the query', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelInvite({
        token: users.token1, channelId: channelId, uId: users.uId2
      });
      const { dmId } = reqDmCreate({
        token: users.token2, uIds: [users.uId1, users.uId2]
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      const message2 = reqMessageSend({
        token: users.token2, channelId, message: 'message 2'
      });
      const message3 = reqMessageSendDM({
        token: users.token2, dmId, message: 'message 3'
      });

      expect(reqSearch({
        token: users.token1, queryStr: 'message'
      })).toStrictEqual({
        messages: [{
          message: 'message 1',
          messageId,
          timeSent: expect.any(Number),
          uId: users.uId1,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        },
        {
          message: 'message 2',
          messageId: message2.messageId,
          timeSent: expect.any(Number),
          uId: users.uId2,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        },
        {
          message: 'message 3',
          messageId: message3.messageId,
          timeSent: expect.any(Number),
          uId: users.uId2,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
          isPinned: false
        }]
      });
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqSearch({
        token: makeInvalidToken(), queryStr: 'message'
      })).toStrictEqual(403);
    });

    test('query is less than 1 character long', () => {
      const users = makeTestUsers();

      expect(reqSearch({
        token: users.token1, queryStr: ''
      })).toStrictEqual(400);
    });

    test('query is more than 1000 characters long', () => {
      const users = makeTestUsers();

      expect(reqSearch({
        token: users.token1, queryStr: 'a'.repeat(1001)
      })).toStrictEqual(400);
    });
  });
});

describe('/message/share/v1', () => {
  describe('success cases', () => {
    test('succesfully share message in channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });

      const { messageId: ogMessageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageShare({
        token: users.token1,
        ogMessageId,
        message: 'new message',
        channelId,
        dmId: -1
      })).toStrictEqual({ sharedMessageId: expect.any(Number) });
    });

    test('succesfully share message in dm', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId2, users.uId3]
      });
      const { messageId: ogMessageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 1'
      });

      expect(reqMessageShare({
        token: users.token1,
        ogMessageId,
        message: 'new message',
        channelId,
        dmId: -1
      })).toStrictEqual({ sharedMessageId: expect.any(Number) });
    });
  });

  describe('error cases', () => {
    test('both channelId and dmId are invalid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId: ogMessageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      expect(reqMessageShare({
        token: users.token1,
        ogMessageId,
        message: 'new message',
        channelId: makeInvalidId(),
        dmId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('neither channelId nor dmid are -1', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId: ogMessageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      expect(reqMessageShare({
        token: users.token1,
        ogMessageId,
        message: 'new message',
        channelId,
        dmId: 1
      })).toStrictEqual(400);
    });

    test('ogMessageId does not refer to a valid message in channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      expect(reqMessageShare({
        token: users.token1,
        ogMessageId: makeInvalidId(),
        message: 'new message',
        channelId,
        dmId: 1
      })).toStrictEqual(400);
    });

    test('ogMessageId does not refer to a valid message in dm', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });

      expect(reqMessageShare({
        token: users.token1,
        ogMessageId: makeInvalidId(),
        message: 'new message',
        channelId,
        dmId: -1
      })).toStrictEqual(400);
    });

    test('message exceeds 1000 characters', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId: ogMessageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      expect(reqMessageShare({
        token: users.token1,
        ogMessageId,
        message: 'a'.repeat(1001),
        channelId,
        dmId: -1
      })).toStrictEqual(400);
    });

    test('not authorised to share', () => {
      const users = makeTestUsers();
      const { channelId: channelId1 } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { channelId: channelId2 } = reqChannelsCreate({
        token: users.token1, name: 'channel 2', isPublic: false
      });
      reqChannelJoin({
        token: users.token2, channelId: channelId1
      });

      const { messageId: ogMessageId } = reqMessageSend({
        token: users.token1, channelId: channelId1, message: 'message 1'
      });

      expect(reqMessageShare({
        token: users.token2,
        ogMessageId,
        message: 'look at this',
        channelId: channelId2,
        dmId: -1
      })).toStrictEqual(403);
    });

    test('invalid token', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId: ogMessageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      expect(reqMessageShare({
        token: makeInvalidToken(),
        ogMessageId,
        message: 'new message',
        channelId,
        dmId: -1
      })).toStrictEqual(403);
    });
  });
});

describe('/notifications/get/v1', () => {
  describe('success cases', () => {
    test('channel add notification', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelInvite({
        token: users.token1, channelId, uId: users.uId2
      });

      expect(reqNotificationsGet({
        token: users.token2,
      })).toStrictEqual({
        notifications: [{
          channelId: channelId,
          dmId: -1,
          notificationMessage: expect.any(String)
        }]
      });
    });

    test('send tagged channel message', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });

      reqMessageSend({
        token: users.token1, channelId, message: '@f1l1 @f1l1'
      });

      expect(reqNotificationsGet({
        token: users.token1,
      })).toStrictEqual({
        notifications: [{
          channelId: channelId,
          dmId: -1,
          notificationMessage: expect.any(String)
        }]
      });
    });

    test('send tagged dm message', () => {
      const users = makeTestUsers();

      const { dmId } = reqDmCreate({
        token: users.token1, uIds: []
      });
      reqMessageSendDM({
        token: users.token1, dmId, message: '@f1l1'
      });

      expect(reqNotificationsGet({
        token: users.token1,
      })).toStrictEqual({
        notifications: [{
          channelId: -1,
          dmId: dmId,
          notificationMessage: expect.any(String)
        }]
      });
    });

    test('send 2 dm message', () => {
      const users = makeTestUsers();

      const { dmId } = reqDmCreate({
        token: users.token1, uIds: []
      });
      reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });
      reqMessageSendDM({
        token: users.token1, dmId, message: '@abc, @f1l1, @f2l2'
      });

      reqMessageSendDM({
        token: users.token1, dmId, message: '@f2l2@f1l1'
      });

      expect(reqNotificationsGet({
        token: users.token1,
      })).toStrictEqual({
        notifications: [{
          channelId: -1,
          dmId: dmId,
          notificationMessage: expect.any(String)
        }, {
          channelId: -1,
          dmId: dmId,
          notificationMessage: expect.any(String)
        }]
      });
    });

    test('add 2 channel notification', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelInvite({
        token: users.token1, channelId, uId: users.uId2
      });
      reqChannelInvite({
        token: users.token1, channelId, uId: users.uId2
      });

      expect(reqNotificationsGet({
        token: users.token2
      })).toStrictEqual({
        notifications: [{
          channelId: channelId,
          dmId: -1,
          notificationMessage: expect.any(String)
        }]
      });
    });

    test('react notification', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      reqMessageReact({
        token: users.token1, messageId, reactId: 1
      });

      expect(reqNotificationsGet({
        token: users.token1,
      })).toStrictEqual({
        notifications: [{
          channelId: channelId,
          dmId: -1,
          notificationMessage: expect.any(String)
        }]
      });
    });
  });
});
