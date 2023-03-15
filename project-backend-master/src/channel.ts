import { authCheck } from './auth';
import { getData, setData } from './dataStore';
import { genericSendMessage, genericListMessages, genericSendMessageLater } from './messages';
import { ChannelDetails } from './types';
import { addStats } from './user';
import HTTPError from 'http-errors';
import { getUserObjectFromId } from './user';

const GLOBAL_OWNER_UID = 1;

/**
 * Determines if a user has the ownership permissions of a channel
 *
 * @param channel - channel to check
 * @param uId - user to check
 */
export const hasChannelOwnershipPerms = (channel: ChannelDetails, uId: number) => {
  if (channel.ownerMembers.includes(uId)) {
    return true;
  }

  if (channel.allMembers.includes(uId) && uId === GLOBAL_OWNER_UID) {
    return true;
  }

  return false;
};

/**
 * Find the channel information, given the channel ID
 *
 * @param {} data - datastore
 * @param {number} channelId - ID of channel
 *
 * @returns {Channel} - channel successfully found
 * @returns {undefined} - invalid channelId
 */
export const findChannelFromId = (channelId: number) => getData().channels.find(
  channel => channel.channelId === channelId
);

/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * provides basic details about the channel.
 *
 * @param {number} authUserId
 * @param {number} channelId
 * @returns {{
 *  name: string, isPublic: string, ownerMembers: User[], allMembers: User[]
 * }} - channel details found
 * @returns {{ error: string }} - invalid channel or user ID, or user not member
 */
export const channelDetailsV1 = (authUserId: number, channelId: number) => {
  const userChannel = findChannelFromId(channelId);

  if (userChannel === undefined) {
    throw HTTPError(400, 'ChannelId not Valid');
  }

  const owners = userChannel.ownerMembers;
  const allMembers = userChannel.allMembers;

  if (!allMembers.includes(authUserId)) {
    throw HTTPError(403, 'Authorised user is not a member of channel');
  }

  return {
    name: userChannel.name,
    isPublic: userChannel.isPublic,
    ownerMembers: owners.map(getUserObjectFromId),
    allMembers: allMembers.map(getUserObjectFromId),
  };
};

/**
 * Given a channelId of a channel that the authorised user can join,
 * adds them to that channel.
 *
 * @param {number} authUserId - Unique identifier for user
 * @param {number} channelId - Unique channel identifier
 *
 * @returns {{ error: string }} - invalid ID's, already member, not allowed to join
 * @returns {{ }} - success
 */
export const channelJoinV1 = (authUserId: number, channelId: number) => {
  const GLOBAL_OWNER_UID = 1;
  const data = getData();

  const userChannel = findChannelFromId(channelId);

  if (userChannel === undefined) {
    throw HTTPError(400, 'channelId not valid');
  }

  const members = userChannel.allMembers;
  if (members.includes(authUserId)) {
    throw HTTPError(400, 'user is already a member of channel');
  }

  if (!userChannel.isPublic && authUserId !== GLOBAL_OWNER_UID) {
    throw HTTPError(403, 'channel is not public');
  }

  members.push(authUserId);
  setData(data);
  addStats(authUserId);

  return {};
};

/**
 * Allows a user to invite another user to a channel they are in
 *
 * @param {integer} authUserId - user who is doing the inviting
 * @param {integer} channelId - channel to be invited to
 * @param {integer} uId - user to be invited
 * @returns {{ error: string }} - error
 * @returns {{}} - success
 */
export const channelInviteV1 = (authUserId: number, channelId: number, uId: number) => {
  const data = getData();
  const channel = findChannelFromId(channelId);

  if (channel === undefined) {
    throw HTTPError(400, 'channel does not exist');
  }
  if (!channel.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not authorised to invite to this channel');
  }

  if (!authCheck(uId)) {
    throw HTTPError(400, 'Invited user does not exist');
  }
  if (channel.allMembers.includes(uId)) {
    throw HTTPError(400, 'Invited user is already in the channel');
  }

  const invitingUser = getData().users.find(user => user.uID === authUserId);
  const invitedUser = getData().users.find(user => user.uID === uId);

  const notifyMessage = `${invitingUser.handleStr} added you to ${channel.name}`;
  invitedUser.notifications.push({
    channelId: channelId, dmId: -1, notificationMessage: notifyMessage
  });

  channel.allMembers.push(uId);
  setData(data);
  addStats(uId);
  return {};
};

/**
 * Returns up to 50 messages between index "start" and "start + 50", on
 * the relevant channel.
 *
 * @param {number} authUserId - user making request
 * @param {number} channelId - channel for which to return messages
 * @param {number} start - index of start of messages (most recent index 0)
 * @returns {{
 *   start: number, end: number, messages: {
 *     messageId: number, uId: number, message: string, timeSent: number
 *   }[]
 * }}
 */
export const channelMessagesV1 = (authUserId: number, channelId: number, start: number) => {
  const channel = findChannelFromId(channelId);
  return genericListMessages(authUserId, channel, start);
};

/**
 * Send a message from the authorised user to the channel specified by channelId
 *
 * @param authUserId - user sending message
 * @param channelId - channel in which message sent
 * @param message - message
 */
export const sendMessageV1 = (authUserId: number, channelId: number, message: string) => {
  const channel = findChannelFromId(channelId);

  return genericSendMessage(authUserId, channel, message, true);
};

/**
 * Send a delayed channel message
 */
export const sendChannelMessageLater = (
  authUserId: number, channelId: number, message: string, timeSent: number
) => {
  const channel = findChannelFromId(channelId);
  return genericSendMessageLater(
    authUserId, channel, channelId, 'channels', message, timeSent
  );
};

/**
 * Make a user leave a channel
 * @param authUserId - user leaving channel
 * @param channelId - channel from which user is leaving
 */
export const channelLeave = (authUserId: number, channelId: number) => {
  const data = getData();
  const channel = findChannelFromId(channelId);

  if (channel === undefined) {
    throw HTTPError(400, 'channel not found');
  }

  if (!channel.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user not currently member of channel');
  }

  if (channel.activeStandup && channel.activeStandup.initiator === authUserId) {
    throw HTTPError(400, 'you are currently in an active standup');
  }

  const removeUser = (arr: number[]) => arr.filter(
    user => user !== authUserId
  );
  channel.ownerMembers = removeUser(channel.ownerMembers);
  channel.allMembers = removeUser(channel.allMembers);

  setData(data);
  addStats(authUserId);

  return {};
};

/**
 * Add an owner to a channel
 */
export const channelAddownerV1 = (authUserId: number, channelId: number, uId: number) => {
  const data = getData();
  const channel = findChannelFromId(channelId);

  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }

  if (!hasChannelOwnershipPerms(channel, authUserId)) {
    throw HTTPError(403, 'User does not have owner permissions in this channel');
  }

  if (!authCheck(uId)) {
    throw HTTPError(400, 'User does not exist');
  }
  if (!channel.allMembers.includes(uId)) {
    throw HTTPError(400, 'User is not a member of this channel');
  }
  if (channel.ownerMembers.includes(uId)) {
    throw HTTPError(400, 'User is already an owner in the channel');
  }

  channel.ownerMembers.push(uId);
  setData(data);

  return {};
};

/**
 * Remove the owner of a channel
 *
 * @param authUserId - user making remove request
 * @param channelId - chanel
 * @param uId - user to remove
 */
export const channelRemoveOwnerV1 = (authUserId: number, channelId: number, uId: number) => {
  const data = getData();
  const channel = findChannelFromId(channelId);

  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }

  if (!hasChannelOwnershipPerms(channel, authUserId)) {
    throw HTTPError(403, 'User not authorised to remove owner');
  }

  if (!authCheck(uId)) {
    throw HTTPError(400, 'User does not exist');
  }

  if (!channel.ownerMembers.includes(uId)) {
    throw HTTPError(400, 'User is not an owner of this channel');
  }

  if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, 'User is the only owner in the channel');
  }

  channel.ownerMembers = channel.ownerMembers.filter(
    owner => owner !== uId
  );

  setData(data);

  return {};
};
