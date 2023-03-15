import { makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import {
  reqAdminUserRemove, reqChannelsCreate, reqChannelJoin,
  reqMessageSend, reqDmCreate, reqMessageSendDM, reqUserProfile,
  reqChannelMessages, reqDmMessages, reqChannelDetails, reqDmDetails,
  reqAdminUserpermissionChange
} from './testWrappers';

beforeEach(() => {
  resetTestState();
});

describe('admin/user/remove/v1', () => {
  describe('success case', () => {
    test('admin removes user', () => {
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

      reqMessageSend({
        token: users.token2, channelId: channelId, message: 'message 1'
      });

      const { dmId: dmId1 } = reqDmCreate({
        token: users.token1, uIds: [users.uId2]
      });

      const { dmId: dmId2 } = reqDmCreate({
        token: users.token2, uIds: [users.uId3]
      });

      reqMessageSendDM({
        token: users.token2, dmId: dmId1, message: 'message 2'
      });

      reqMessageSendDM({
        token: users.token2, dmId: dmId2, message: 'message 3'
      });

      reqMessageSendDM({
        token: users.token3, dmId: dmId2, message: 'message 4'
      });

      reqAdminUserRemove({ token: users.tokenGlobalOwner, uId: users.uId2 });

      let response = reqUserProfile({ token: users.token1, uId: users.uId2 });
      expect(response).toEqual({
        user: {
          uId: users.uId2,
          email: expect.any(String),
          nameFirst: 'Removed',
          nameLast: 'user',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      });

      response = reqChannelMessages({ token: users.token1, channelId: channelId, start: 0 });
      expect(response.messages).toEqual([
        {
          messageId: expect.any(Number),
          uId: users.uId2,
          message: 'Removed user',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
        }
      ]);

      response = reqDmMessages({ token: users.token1, dmId: dmId1, start: 0 });
      expect(response.messages).toEqual([
        {
          messageId: expect.any(Number),
          uId: users.uId2,
          message: 'Removed user',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
        }
      ]);

      response = reqDmMessages({ token: users.token3, dmId: dmId2, start: 0 });
      expect(response.messages).toEqual([
        {
          messageId: expect.any(Number),
          uId: users.uId3,
          message: 'message 4',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
        },
        {
          messageId: expect.any(Number),
          uId: users.uId2,
          message: 'Removed user',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }],
        }
      ]);

      response = reqChannelDetails({ token: users.token2, channelId: channelId });
      expect(response).toStrictEqual(403);

      response = reqDmDetails({ token: users.token2, dmId: dmId1 });
      expect(response).toStrictEqual(403);

      response = reqDmDetails({ token: users.token2, dmId: dmId2 });
      expect(response).toStrictEqual(403);

      response = reqMessageSendDM({
        token: users.token2, dmId: dmId1, message: 'message 5'
      });
      expect(response).toStrictEqual(403);
    });
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const token = makeInvalidToken();
      const response = reqAdminUserRemove({ token: token, uId: users.uId2 });
      expect(response).toStrictEqual(403);
    });

    test('invalid uId', () => {
      const users = makeTestUsers();
      let response = reqAdminUserRemove({ token: users.tokenGlobalOwner, uId: 0 });
      expect(response).toStrictEqual(400);

      reqAdminUserRemove({ token: users.tokenGlobalOwner, uId: users.uId1 });
      response = reqAdminUserRemove({ token: users.tokenGlobalOwner, uId: users.uId1 });
      expect(response).toStrictEqual(400);
    });

    test('non-admin user called', () => {
      const users = makeTestUsers();
      const response = reqAdminUserRemove({ token: users.token2, uId: users.uId2 });
      expect(response).toStrictEqual(403);
    });

    test('last global owner removed', () => {
      const users = makeTestUsers();
      const response = reqAdminUserRemove({ token: users.tokenGlobalOwner, uId: users.uIdGlobalOwner });
      expect(response).toStrictEqual(400);
    });
  });
});

describe('admin/user/permission/change/v1', () => {
  test('success case', () => {
    const users = makeTestUsers();
    reqAdminUserpermissionChange({ token: users.tokenGlobalOwner, uId: users.uId2, permissionId: 1 });
    let response = reqAdminUserRemove({ token: users.token2, uId: users.uId2 });
    expect(response).toEqual({});
    reqAdminUserpermissionChange({ token: users.tokenGlobalOwner, uId: users.uId2, permissionId: 2 });
    response = reqAdminUserRemove({ token: users.token2, uId: users.uId2 });
    expect(response).toStrictEqual(403);
  });

  describe('error cases', () => {
    test('invalid token', () => {
      const users = makeTestUsers();
      const token = makeInvalidToken();
      const response = reqAdminUserpermissionChange({ token: token, uId: users.uId2, permissionId: 1 });
      expect(response).toStrictEqual(403);
    });

    test('invalid uId', () => {
      const users = makeTestUsers();
      const response = reqAdminUserpermissionChange({ token: users.tokenGlobalOwner, uId: 0, permissionId: 1 });
      expect(response).toStrictEqual(400);
    });

    test('invalid permissionId', () => {
      const users = makeTestUsers();
      const response = reqAdminUserpermissionChange({ token: users.tokenGlobalOwner, uId: users.uId2, permissionId: 0 });
      expect(response).toStrictEqual(400);
    });

    test('non-admin user called', () => {
      const users = makeTestUsers();
      const response = reqAdminUserpermissionChange({ token: users.token2, uId: users.uId2, permissionId: 1 });
      expect(response).toStrictEqual(403);
    });

    test('last global owner permission changed', () => {
      const users = makeTestUsers();
      const response = reqAdminUserpermissionChange({ token: users.tokenGlobalOwner, uId: users.uIdGlobalOwner, permissionId: 2 });
      expect(response).toStrictEqual(400);
    });

    test('permission unchanged', () => {
      const users = makeTestUsers();
      const response = reqAdminUserpermissionChange({ token: users.tokenGlobalOwner, uId: users.uId2, permissionId: 2 });
      expect(response).toStrictEqual(400);
    });
  });
});
