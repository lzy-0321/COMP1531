import { makeInvalidId, makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import { reqChannelAddOwner, reqChannelDetails, reqChannelInvite, reqChannelJoin, reqChannelLeave, reqChannelRemoveOwner, reqChannelsCreate, reqStandupStart, reqUserProfile } from './testWrappers';

beforeEach(resetTestState);
afterAll(resetTestState);

describe('channel/details/v2', () => {
  describe('success cases', () => {
    test('simple channel details', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      const result = reqChannelDetails({
        token: users.token1,
        channelId: channel.channelId
      });

      expect(result).toStrictEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [{
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }],
        allMembers: [{
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }]
      });
    });

    test('non-owner user looking at channelDetails', () => {
      const users = makeTestUsers();
      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId,
      });

      const result = reqChannelDetails({
        token: users.token2,
        channelId: channel.channelId
      });
      result.allMembers = new Set(result.allMembers);

      expect(result).toMatchObject({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [{
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }],
        allMembers: new Set([{
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
        {
          uId: users.uId2,
          email: 'user2@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }])
      });
    });

    test('multiple members inside the channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId,
      });
      reqChannelJoin({
        token: users.token3,
        channelId: channel.channelId,
      });

      const result = reqChannelDetails({
        token: users.token1,
        channelId: channel.channelId
      });

      result.allMembers = new Set(result.allMembers);

      expect(result).toEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [{
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }],
        allMembers: new Set([{
          uId: users.uId1,
          email: 'user1@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
        {
          uId: users.uId2,
          email: 'user2@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
        {
          uId: users.uId3,
          email: 'user3@example.com',
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }])
      });
    });
  });

  describe('error cases', () => {
    test('invalid channelId', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      const result = reqChannelDetails({
        token: users.token1,
        channelId: Math.max(channel.channelId) + 1
      });
      expect(result).toStrictEqual(400);
    });

    test('invalid token', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      const result = reqChannelDetails({
        token: makeInvalidToken(),
        channelId: channel.channelId
      });
      expect(result).toStrictEqual(403);
    });

    test('channelId valid, user not member', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      const result = reqChannelDetails({
        token: users.token2,
        channelId: channel.channelId
      });
      expect(result).toStrictEqual(403);
    });
  });
});

describe('channel/join/v2', () => {
  describe('success', () => {
    test('successful channel join', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      })).toStrictEqual({});
    });

    test('successful channel join for global owner', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: false
      });

      const result = reqChannelJoin({
        token: users.tokenGlobalOwner,
        channelId: channel.channelId
      });

      expect(result).toStrictEqual({});
    });
  });

  describe('error cases', () => {
    test('invalid channelId', () => {
      const users = makeTestUsers();

      reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      const result = reqChannelJoin({
        token: users.token2,
        channelId: makeInvalidId()
      });

      expect(result).toStrictEqual(400);
    });

    test('creator is already a member of channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      expect(reqChannelJoin({
        token: users.token1,
        channelId: channel.channelId
      })).toStrictEqual(400);
    });

    test('channel is not public', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: false
      });

      expect(reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      })).toStrictEqual(403);
    });

    test('token invalid', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelJoin({
        token: makeInvalidToken(),
        channelId: channel.channelId
      })).toStrictEqual(403);
    });

    test('authorised member is already a member of channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });

      expect(reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      })).toStrictEqual(400);
    });
  });
});

describe('/channel/invite/v2', () => {
  describe('succes case', () => {
    test('successful invite', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelInvite({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelInvite({
        token: makeInvalidToken(),
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual(403);
    });

    test('channel does not exist', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelInvite({
        token: users.token1,
        channelId: channel.channelId + 1,
        uId: users.uId2
      })).toStrictEqual(400);
    });

    test('invited user does not exist', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelInvite({
        token: users.token1,
        channelId: channel.channelId,
        uId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('invited user is already a member of the channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelInvite({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});

      expect(reqChannelInvite({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual(400);
    });

    test('user is not authorised to invite to the channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelInvite({
        token: users.token2,
        channelId: channel.channelId,
        uId: users.uId3
      })).toStrictEqual(403);
    });
  });
});

describe('channel/leave/v1', () => {
  describe('success case', () => {
    test('succesfully leaving', () => {
      const users = makeTestUsers();
      const channel = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelInvite({
        token: users.token1, channelId: channel.channelId, uId: users.uId2
      });
      expect(reqChannelLeave({
        token: users.token2, channelId: channel.channelId
      })).toStrictEqual({});
      expect(reqChannelDetails({
        token: users.token2, channelId: channel.channelId
      })).toStrictEqual(403);
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate(
        { token: users.token1, name: 'channel 1', isPublic: true }
      );
      expect(reqChannelLeave({
        token: makeInvalidToken(), channelId: channel
      })).toEqual(403);
    });

    test('leaving an invalid channel', () => {
      const users = makeTestUsers();
      reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: false
      });
      reqChannelsCreate({
        token: users.token1, name: 'channel 2', isPublic: false
      });
      expect(reqChannelLeave({
        token: users.token1, channelId: makeInvalidId()
      })).toEqual(400);
    });

    test('leaving when not a member', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqChannelLeave({
        token: users.token2, channelId: channel.channelId
      })).toEqual(403);
    });

    test('leaving after creating standup', () => {
      const users = makeTestUsers();

      const { channelId } = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      reqChannelJoin({ token: users.token2, channelId });

      reqStandupStart({
        token: users.token2, channelId, length: 60
      });

      expect(reqChannelLeave({
        token: users.token2, channelId: channelId
      })).toEqual(400);
    });
  });
});

describe('combined joining, inviting and leaving', () => {
  describe('success case', () => {
    test('joining, leaving and then inviting same user', () => {
      const users = makeTestUsers();

      const user1 = reqUserProfile({
        token: users.token2, uId: users.uId1
      }).user;
      const user2 = reqUserProfile({
        token: users.token2, uId: users.uId2
      }).user;

      const channel = reqChannelsCreate({
        token: users.token1, name: 'channel 1', isPublic: true
      });

      expect(reqChannelDetails({
        token: users.token1, channelId: channel.channelId
      })).toStrictEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [user1],
        allMembers: [user1]
      });

      reqChannelJoin({ token: users.token2, channelId: channel.channelId });
      expect(reqChannelDetails({
        token: users.token1, channelId: channel.channelId
      })).toStrictEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [user1],
        allMembers: [user1, user2]
      });
      expect(reqChannelDetails({
        token: users.token2, channelId: channel.channelId
      })).toStrictEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [user1],
        allMembers: [user1, user2]
      });

      reqChannelLeave({ token: users.token2, channelId: channel.channelId });
      expect(reqChannelDetails({
        token: users.token1, channelId: channel.channelId
      })).toStrictEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [user1],
        allMembers: [user1]
      });
      expect(reqChannelDetails({
        token: users.token2, channelId: channel.channelId
      })).toStrictEqual(403);

      reqChannelInvite({
        token: users.token1, channelId: channel.channelId, uId: users.uId2
      });
      expect(reqChannelDetails({
        token: users.token2, channelId: channel.channelId
      })).toStrictEqual({
        name: 'channel 1',
        isPublic: true,
        ownerMembers: [user1],
        allMembers: [user1, user2]
      });
    });
  });
});

describe('channel/addowner/v1', () => {
  describe('success case', () => {
    test('successful adding of owner', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });
      const result = reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      });
      expect(result).toStrictEqual({});
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({ token: users.token2, channelId: channel.channelId });

      const result = reqChannelAddOwner({
        token: makeInvalidToken(),
        channelId: channel.channelId,
        uId: users.uId2
      });
      expect(result).toStrictEqual(403);
    });

    test('invalid channelId', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({ token: users.token2, channelId: channel.channelId });

      const result = reqChannelAddOwner({
        token: users.token1,
        channelId: makeInvalidId(),
        uId: users.uId2
      });

      expect(result).toStrictEqual(400);
    });

    test('user does not exist', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('user not a member of the channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });

      reqChannelJoin({ token: users.token2, channelId: channel.channelId });

      const result = reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId3
      });

      expect(result).toStrictEqual(400);
    });

    test('user is already an owner of the channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual(400);
    });

    test('authorised user does not have owner permissions', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId,
      });
      const result = reqChannelAddOwner({
        token: users.token2,
        channelId: channel.channelId,
        uId: users.uId2
      });
      expect(result).toStrictEqual(403);
    });
  });
});

describe('channel/removeowner/v1', () => {
  describe('success case', () => {
    test('Test Success channel/removeowner/v1', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});

      expect(reqChannelRemoveOwner({
        token: users.token2,
        channelId: channel.channelId,
        uId: users.uId1
      })).toStrictEqual({});

      const details = reqChannelDetails({
        token: users.token1, channelId: channel.channelId
      });
      expect(details.ownerMembers.length).toStrictEqual(1);
      expect(details.ownerMembers[0].uId).toStrictEqual(users.uId2);
      expect(details.allMembers.length).toStrictEqual(2);
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});

      expect(reqChannelRemoveOwner({
        token: makeInvalidToken(),
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual(403);
    });

    test('invalid channelId', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});

      expect(reqChannelRemoveOwner({
        token: users.token1,
        channelId: makeInvalidId(),
        uId: users.uId2
      })).toStrictEqual(400);
    });

    test('user does not exist', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });

      expect(reqChannelAddOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual({});

      expect(reqChannelRemoveOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: makeInvalidId()
      })).toStrictEqual(400);
    });

    test('authorised user is not an owner of this channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });
      expect(reqChannelRemoveOwner({
        token: users.token2,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual(403);
    });

    test('user is not an owner of this channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: true
      });
      reqChannelJoin({
        token: users.token2,
        channelId: channel.channelId
      });
      reqChannelJoin({
        token: users.token3,
        channelId: channel.channelId
      });
      expect(reqChannelRemoveOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId2
      })).toStrictEqual(400);
    });

    test('user is the only owner of this channel', () => {
      const users = makeTestUsers();

      const channel = reqChannelsCreate({
        token: users.token1,
        name: 'channel 1',
        isPublic: false
      });
      expect(reqChannelRemoveOwner({
        token: users.token1,
        channelId: channel.channelId,
        uId: users.uId1
      })).toStrictEqual(400);
    });
  });
});
