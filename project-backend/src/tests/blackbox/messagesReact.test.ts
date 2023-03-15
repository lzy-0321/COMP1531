import { makeInvalidId, makeTestUsers, resetTestState } from './testUtil';
import { reqChannelMessages, reqChannelsCreate, reqDmCreate, reqDmMessages, reqMessageSend, reqMessageSendDM, reqMessageReact, reqMessageUnreact, reqChannelJoin } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('Tests for messages/react/v1', () => {
  describe('Test successes', () => {
    test('Successful React channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      expect(reqMessageReact({ token: users.token1, messageId, reactId: 1 })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId: messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false,
      }]);
    });
    test('Successful React for multiple users', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      reqChannelJoin({ token: users.token2, channelId: channelId });
      reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
      expect(reqMessageReact({ token: users.token2, messageId: messageId, reactId: 1 })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1, users.uId2],
          isThisUserReacted: true,
        }],
        isPinned: false,
      }]);
    });
    test('Successful React in DM', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId1, users.uId2]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      expect(reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 })).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: false,
        }],
        isPinned: false
      }]);
    });
  });
  describe('Error cases in channel', () => {
    test('MessageId is not valid', () => {
      const users = makeTestUsers();
      expect(reqMessageReact({ token: users.token1, messageId: makeInvalidId(), reactId: 1 })).toStrictEqual(400);
    });
    test('ReactId is not valid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 3'
      });

      expect(reqMessageReact({ token: users.token1, messageId: messageId, reactId: 2 })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 3',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }],
        isPinned: false
      }]);
    });
    test('message already reacted to', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageReact({
        token: users.token1, messageId: messageId, reactId: 1
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
      expect(reqMessageReact({
        token: users.token1, messageId: messageId, reactId: 1
      })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
    });
    test('user not authorised to react', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });

      expect(reqMessageReact({
        token: users.token1, messageId: messageId, reactId: 1
      })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
      expect(reqMessageReact({
        token: users.token2, messageId: messageId, reactId: 1
      })).toStrictEqual(400);
    });
  });
  describe('Error cases for DM', () => {
    test('messageId is invalid', () => {
      const users = makeTestUsers();
      expect(reqMessageReact({ token: users.token1, messageId: makeInvalidId(), reactId: 1 })).toStrictEqual(400);
    });
    test('reactId is invalid', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId1, users.uId2]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      expect(reqMessageReact({ token: users.token1, messageId: messageId, reactId: 2 })).toStrictEqual(400);
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }],
        isPinned: false
      }]);
    });
    test('message has already been reacted to', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId1, users.uId2]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      expect(reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 })).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: false,
        }],
        isPinned: false
      }]);
      expect(reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 })).toStrictEqual(400);
    });
  });
});

describe('Tests for messages/unreact/v1', () => {
  describe('Test successes', () => {
    test('Successful unreact channel', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      reqMessageReact({ token: users.token1, messageId, reactId: 1 });
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId: messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false,
      }]);
      expect(reqMessageUnreact({ token: users.token1, messageId, reactId: 1 })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId: messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }],
        isPinned: false,
      }]);
    });
    test('Successful unreact for multiple users', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 1'
      });
      reqChannelJoin({ token: users.token2, channelId });
      reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
      reqMessageReact({ token: users.token2, messageId: messageId, reactId: 1 });
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1, users.uId2],
          isThisUserReacted: true,
        }],
        isPinned: false,
      }]);
      expect(reqMessageUnreact({ token: users.token2, messageId: messageId, reactId: 1 })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false,
      }]);
      expect(reqMessageUnreact({ token: users.token1, messageId: messageId, reactId: 1 })).toStrictEqual({});
      expect(reqChannelMessages({
        token: users.token1, channelId: channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 1',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }],
        isPinned: false,
      }]);
    });
    test('Successful Unreact in DM', () => {
      const users = makeTestUsers();
      const { dmId } = reqDmCreate({
        token: users.token1, uIds: [users.uId1, users.uId2]
      });
      const { messageId } = reqMessageSendDM({
        token: users.token1, dmId, message: 'message 2'
      });
      reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: false,
        }],
        isPinned: false
      }]);
      expect(reqMessageUnreact({ token: users.token1, messageId: messageId, reactId: 1 })).toStrictEqual({});
      expect(reqDmMessages({
        token: users.token2, dmId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 2',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }],
        isPinned: false
      }]);
    });
  });
  describe('Error cases in channel', () => {
    test('MessageId is not valid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 3'
      });
      reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 3',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
      expect(reqMessageUnreact({ token: users.token1, messageId: makeInvalidId(), reactId: 1 })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 3',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
    });
    test('ReactId is not valid', () => {
      const users = makeTestUsers();
      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      const { messageId } = reqMessageSend({
        token: users.token1, channelId, message: 'message 3'
      });

      reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 3',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
      expect(reqMessageUnreact({ token: users.token1, messageId: messageId, reactId: 2 })).toStrictEqual(400);
      expect(reqChannelMessages({
        token: users.token1, channelId, start: 0
      }).messages).toStrictEqual([{
        message: 'message 3',
        messageId,
        timeSent: expect.any(Number),
        uId: users.uId1,
        reacts: [{
          reactId: 1,
          uIds: [users.uId1],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]);
    });
  });
  test('no react to unreact to', () => {
    const users = makeTestUsers();
    const { channelId } = reqChannelsCreate({
      token: users.token1, name: 'channel 1', isPublic: true
    });
    const { messageId } = reqMessageSend({
      token: users.token1, channelId, message: 'message 1'
    });

    expect(reqChannelMessages({
      token: users.token1, channelId, start: 0
    }).messages).toStrictEqual([{
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
    }]);
    expect(reqMessageUnreact({
      token: users.token1, messageId: messageId, reactId: 1
    })).toStrictEqual(400);
  });
});
describe('Error cases for DM', () => {
  test('messageId is invalid', () => {
    const users = makeTestUsers();
    const { dmId } = reqDmCreate({
      token: users.token1, uIds: [users.uId1, users.uId2]
    });
    const { messageId } = reqMessageSendDM({
      token: users.token1, dmId, message: 'message 2'
    });
    reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
    expect(reqDmMessages({
      token: users.token2, dmId, start: 0
    }).messages).toStrictEqual([{
      message: 'message 2',
      messageId,
      timeSent: expect.any(Number),
      uId: users.uId1,
      reacts: [{
        reactId: 1,
        uIds: [users.uId1],
        isThisUserReacted: false,
      }],
      isPinned: false
    }]);
    expect(reqMessageUnreact({ token: users.token1, messageId: makeInvalidId(), reactId: 1 })).toStrictEqual(400);
    expect(reqDmMessages({
      token: users.token2, dmId, start: 0
    }).messages).toStrictEqual([{
      message: 'message 2',
      messageId,
      timeSent: expect.any(Number),
      uId: users.uId1,
      reacts: [{
        reactId: 1,
        uIds: [users.uId1],
        isThisUserReacted: false,
      }],
      isPinned: false
    }]);
  });
  test('reactId is invalid', () => {
    const users = makeTestUsers();
    const { dmId } = reqDmCreate({
      token: users.token1, uIds: [users.uId1, users.uId2]
    });
    const { messageId } = reqMessageSendDM({
      token: users.token1, dmId, message: 'message 2'
    });
    reqMessageReact({ token: users.token1, messageId: messageId, reactId: 1 });
    expect(reqDmMessages({
      token: users.token2, dmId, start: 0
    }).messages).toStrictEqual([{
      message: 'message 2',
      messageId,
      timeSent: expect.any(Number),
      uId: users.uId1,
      reacts: [{
        reactId: 1,
        uIds: [users.uId1],
        isThisUserReacted: false,
      }],
      isPinned: false
    }]);
    expect(reqMessageUnreact({ token: users.token1, messageId: messageId, reactId: 2 })).toStrictEqual(400);
    expect(reqDmMessages({
      token: users.token2, dmId, start: 0
    }).messages).toStrictEqual([{
      message: 'message 2',
      messageId,
      timeSent: expect.any(Number),
      uId: users.uId1,
      reacts: [{
        reactId: 1,
        uIds: [users.uId1],
        isThisUserReacted: false,
      }],
      isPinned: false
    }]);
  });
  test('No react to react to', () => {
    const users = makeTestUsers();
    const { dmId } = reqDmCreate({
      token: users.token1, uIds: [users.uId1, users.uId2]
    });
    const { messageId } = reqMessageSendDM({
      token: users.token1, dmId, message: 'message 2'
    });
    expect(reqDmMessages({
      token: users.token2, dmId, start: 0
    }).messages).toStrictEqual([{
      message: 'message 2',
      messageId,
      timeSent: expect.any(Number),
      uId: users.uId1,
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }],
      isPinned: false
    }]);
    expect(reqMessageUnreact({ token: users.token1, messageId: messageId, reactId: 1 })).toStrictEqual(400);
  });
});
