import { makeRequest, addSeenId } from './testUtil';

/**
 * A wrapper for the `auth/login/v3` endpoint for testing
 */
export const reqAuthLogin = (data: { email: string, password: string }) => {
  return makeRequest('POST', '/auth/login/v3', data);
};

/**
 * A wrapper for the `auth/register/v3` endpoint for testing
 */
export const reqAuthRegister = (data: { email: string, password: string, nameFirst: string, nameLast: string }) => {
  const result = makeRequest('POST', '/auth/register/v3', data);
  if (typeof result === 'object' && !result.error) {
    addSeenId(result.authUserId);
  }
  return result;
};

/**
 * A wrapper for the `channels/create/v3` endpoint for testing
 */
export const reqChannelsCreate = (data: { token: string, name: string, isPublic: boolean }) => {
  const result = makeRequest('POST', '/channels/create/v3', data);
  if (typeof result === 'object' && !result.error) {
    addSeenId(result.channelId);
  }
  return result;
};

/**
 * A wrapper for the `channels/list/v3` endpoint for testing
 */
export const reqChannelsList = (data: { token: string }) => {
  return makeRequest('GET', '/channels/list/v3', data);
};

/**
 * A wrapper for the `channels/listall/v3` endpoint for testing
 */
export const reqChannelsListAll = (data: { token: string }) => {
  return makeRequest('GET', '/channels/listall/v3', data);
};

/**
 * A wrapper for the `channel/details/v3` endpoint for testing
 */
export const reqChannelDetails = (data: { token: string, channelId: number }) => {
  return makeRequest('GET', '/channel/details/v3', data);
};

/**
 * A wrapper for the `channel/join/v3` endpoint for testing
 */
export const reqChannelJoin = (data: { token: string, channelId: number }) => {
  return makeRequest('POST', '/channel/join/v3', data);
};

/**
 * A wrapper for the `channel/invite/v3` endpoint for testing
 */
export const reqChannelInvite = (data: { token: string, channelId: number, uId: number }) => {
  return makeRequest('POST', '/channel/invite/v3', data);
};

/**
 * A wrapper for the `channel/messages/v3` endpoint for testing
 */
export const reqChannelMessages = (data: { token: string, channelId: number, start: number }) => {
  return makeRequest('GET', '/channel/messages/v3', data);
};

/**
 * A wrapper for the `user/profile/v3` endpoint for testing
 */
export const reqUserProfile = (data: { token: string, uId: number }) => {
  return makeRequest('GET', '/user/profile/v3', data);
};

/**
 * A wrapper for the `clear/v1` endpoint for testing
 */
export const reqClear = () => {
  return makeRequest('DELETE', '/clear/v1', {});
};

/**
 * A wrapper for the `auth/logout/v2` endpoint for testing
 */
export const reqAuthLogout = (data: { token: string }) => {
  return makeRequest('POST', '/auth/logout/v2', data);
};

/**
 * A wrapper for the `channel/leave/v2` endpoint for testing
 */
export const reqChannelLeave = (data: { token: string, channelId: number }) => {
  return makeRequest('POST', '/channel/leave/v2', data);
};

/**
 * A wrapper for the `channel/addowner/v2` endpoint for testing
 */
export const reqChannelAddOwner = (data: { token: string, channelId: number, uId: number }) => {
  return makeRequest('POST', '/channel/addowner/v2', data);
};

/**
 * A wrapper for the `channel/removeowner/v2` endpoint for testing
 */
export const reqChannelRemoveOwner = (data: { token: string, channelId: number, uId: number }) => {
  return makeRequest('POST', '/channel/removeowner/v2', data);
};

/**
 * A wrapper for the `message/send/v2` endpoint for testing
 */
export const reqMessageSend = (data: { token: string, channelId: number, message: string }) => {
  const result = makeRequest('POST', '/message/send/v2', data);
  if (typeof result === 'object' && !result.error) {
    addSeenId(result.messageId);
  }
  return result;
};

/**
 * A wrapper for the `message/edit/v2` endpoint for testing
 */
export const reqMessageEdit = (data: { token: string, messageId: number, message: string }) => {
  return makeRequest('PUT', '/message/edit/v2', data);
};

/**
 * A wrapper for the `message/remove/v2` endpoint for testing
 */
export const reqMessageRemove = (data: { token: string, messageId: number }) => {
  return makeRequest('DELETE', '/message/remove/v2', data);
};

/**
 * A wrapper for the `dm/create/v2` endpoint for testing
 */
export const reqDmCreate = (data: { token: string, uIds: number[] }) => {
  const result = makeRequest('POST', '/dm/create/v2', data);
  if (typeof result === 'object' && !result.error) {
    addSeenId(result.dmId);
  }
  return result;
};

/**
 * A wrapper for the `dm/list/v2` endpoint for testing
 */
export const reqDmList = (data: { token: string }) => {
  return makeRequest('GET', '/dm/list/v2', data);
};

/**
 * A wrapper for the `dm/remove/v2` endpoint for testing
 */
export const reqDmRemove = (data: { token: string, dmId: number }) => {
  return makeRequest('DELETE', '/dm/remove/v2', data);
};

/**
 * A wrapper for the `dm/details/v2` endpoint for testing
 */
export const reqDmDetails = (data: { token: string, dmId: number }) => {
  return makeRequest('GET', '/dm/details/v2', data);
};

/**
 * A wrapper for the `dm/leave/v2` endpoint for testing
 */
export const reqDmLeave = (data: { token: string, dmId: number }) => {
  return makeRequest('POST', '/dm/leave/v2', data);
};

/**
 * A wrapper for the `dm/messages/v2` endpoint for testing
 */
export const reqDmMessages = (data: { token: string, dmId: number, start: number }) => {
  return makeRequest('GET', '/dm/messages/v2', data);
};

/**
 * A wrapper for the `message/senddm/v2` endpoint for testing
 */
export const reqMessageSendDM = (data: { token: string, dmId: number, message: string }) => {
  const result = makeRequest('POST', '/message/senddm/v2', data);
  if (typeof result === 'object' && !result.error) {
    addSeenId(result.messageId);
  }
  return result;
};

/**
 * A wrapper for the `users/all/v2` endpoint for testing
 */
export const reqUsersAll = (data: { token: string }) => {
  return makeRequest('GET', '/users/all/v2', data);
};

/**
 * A wrapper for the `user/profile/setname/v2` endpoint for testing
 */
export const reqUserProfileSetName = (data: { token: string, nameFirst: string, nameLast: string }) => {
  return makeRequest('PUT', '/user/profile/setname/v2', data);
};

/**
 * A wrapper for the `user/profile/setemail/v2` endpoint for testing
 */
export const reqUserProfileSetEmail = (data: { token: string, email: string }) => {
  return makeRequest('PUT', '/user/profile/setemail/v2', data);
};

/**
 * A wrapper for the `user/profile/sethandle/v2` endpoint for testing
 */
export const reqUserProfileSetHandle = (data: { token: string, handleStr: string }) => {
  return makeRequest('PUT', '/user/profile/sethandle/v2', data);
};

/**
 * A wrapper for the `notifications/get/v1` endpoint for testing
 */
export const reqNotificationsGet = (data: { token: string }) => {
  return makeRequest('GET', '/notifications/get/v1', data);
};

/**
 * A wrapper for the `search/v1` endpoint for testing
 */
export const reqSearch = (data: { token: string, queryStr: string }) => {
  return makeRequest('GET', '/search/v1', data);
};

/**
 * A wrapper for the `message/share/v1` endpoint for testing
 */
export const reqMessageShare = (data: { token: string, ogMessageId: number, message: string, channelId: number, dmId: number }) => {
  return makeRequest('POST', '/message/share/v1', data);
};

/**
 * A wrapper for the `message/react/v1` endpoint for testing
 */
export const reqMessageReact = (data: { token: string, messageId: number, reactId: number }) => {
  return makeRequest('POST', '/message/react/v1', data);
};

/**
 * A wrapper for the `message/unreact/v1` endpoint for testing
 */
export const reqMessageUnreact = (data: { token: string, messageId: number, reactId: number }) => {
  return makeRequest('POST', '/message/unreact/v1', data);
};

/**
 * A wrapper for the `message/pin/v1` endpoint for testing
 */
export const reqMessagePin = (data: { token: string, messageId: number }) => {
  return makeRequest('POST', '/message/pin/v1', data);
};

/**
 * A wrapper for the `message/unpin/v1` endpoint for testing
 */
export const reqMessageUnpin = (data: { token: string, messageId: number }) => {
  return makeRequest('POST', '/message/unpin/v1', data);
};

/**
 * A wrapper for the `message/sendlater/v1` endpoint for testing
 */
export const reqMessageSendLater = (data: { token: string, channelId: number, message: string, timeSent: number }) => {
  return makeRequest('POST', '/message/sendlater/v1', data);
};

/**
 * A wrapper for the `message/sendlaterdm/v1` endpoint for testing
 */
export const reqMessageSendLaterDM = (data: { token: string, dmId: number, message: string, timeSent: number }) => {
  return makeRequest('POST', '/message/sendlaterdm/v1', data);
};

/**
 * A wrapper for the `standup/start/v1` endpoint for testing
 */
export const reqStandupStart = (data: { token: string, channelId: number, length: number }) => {
  return makeRequest('POST', '/standup/start/v1', data);
};

/**
 * A wrapper for the `standup/active/v1` endpoint for testing
 */
export const reqStandupActive = (data: { token: string, channelId: number }) => {
  return makeRequest('GET', '/standup/active/v1', data);
};

/**
 * A wrapper for the `standup/send/v1` endpoint for testing
 */
export const reqStandupSend = (data: { token: string, channelId: number, message: string }) => {
  return makeRequest('POST', '/standup/send/v1', data);
};

/**
 * A wrapper for the `auth/passwordreset/request/v1` endpoint for testing
 */
export const reqAuthPasswordResetRequest = (data: { email: string }) => {
  return makeRequest('POST', '/auth/passwordreset/request/v1', data);
};

/**
 * A wrapper for the `auth/passwordreset/reset/v1` endpoint for testing
 */
export const reqAuthPasswordResetReset = (data: { resetCode: string, newPassword: string }) => {
  return makeRequest('POST', '/auth/passwordreset/reset/v1', data);
};

/**
 * A wrapper for the `user/profile/uploadphoto/v1` endpoint for testing
 */
export const reqUserProfileUploadPhoto = (data: { token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number }) => {
  return makeRequest('POST', '/user/profile/uploadphoto/v1', data);
};

/**
 * A wrapper for the `user/stats/v1` endpoint for testing
 */
export const reqUserStats = (data: { token: string }) => {
  return makeRequest('GET', '/user/stats/v1', data);
};

/**
 * A wrapper for the `users/stats/v1` endpoint for testing
 */
export const reqUsersStats = (data: { token: string }) => {
  return makeRequest('GET', '/users/stats/v1', data);
};

/**
 * A wrapper for the `admin/user/remove/v1` endpoint for testing
 */
export const reqAdminUserRemove = (data: { token: string, uId: number }) => {
  return makeRequest('DELETE', '/admin/user/remove/v1', data);
};

/**
 * A wrapper for the `admin/userpermission/change/v1` endpoint for testing
 */
export const reqAdminUserpermissionChange = (data: { token: string, uId: number, permissionId: number }) => {
  return makeRequest('POST', '/admin/userpermission/change/v1', data);
};
