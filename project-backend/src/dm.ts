import { getData, setData } from './dataStore';
import { authCheck } from './auth';
import { genericListMessages, genericSendMessage, genericSendMessageLater } from './messages';
import { addStats } from './user';
import HTTPError from 'http-errors';
import { getUserObjectFromId } from './user';

/**
 * Returns true if the given array is unique, false otherwise
 *
 * @param arr - array to check
 */
const checkArrayIsUnique = (arr: number[]) => arr.every(
  element1 => arr.filter(element2 => element1 === element2).length === 1
);

/**
 * Create and store a new DM, returning the DM id
 *
 * @param uId - user creating DM
 * @param uIds - other users who will be in DM
 */
export const createDM = (uId: number, uIds: number[]) => {
  if (!checkArrayIsUnique(uIds)) {
    throw HTTPError(400, 'duplicate user');
  }

  if (uIds.some(uId => !authCheck(uId))) {
    throw HTTPError(400, 'invalid user in uIds');
  }

  const data = getData();

  const allMembers = [...uIds, uId];
  const name = allMembers.map(
    uId => data.users.find(user => user.uID === uId).handleStr
  ).sort().join(', ');
  const dmId = data.dms.length + 1;

  data.dms.push({
    dmId: dmId, owner: uId, allMembers, name: name, messageIds: [], deleted: false
  });

  setData(data);
  for (const user of allMembers) {
    addStats(user);
  }

  const invitingUser = getData().users.find(user => user.uID === uId);

  for (const invitedId of uIds) {
    const invitedUser = getData().users.find(user => user.uID === invitedId);

    const notifyMessage = `${invitingUser.handleStr} added you to ${name}`;
    invitedUser.notifications.push({
      channelId: -1, dmId: dmId, notificationMessage: notifyMessage
    });
  }

  return { dmId };
};

/**
 * Remove use from DM, returning {}
 *
 * @param uId - user creating DM
 * @param uIds - other users who will be in DM
 */
export const dmLeave = (uId: number, dmId: number) => {
  const dm = findDMFromId(dmId);

  if (dm === undefined) {
    throw HTTPError(400, 'DM does not exist');
  }

  if (!dm.allMembers.includes(uId)) {
    throw HTTPError(403, 'user not a member of DM');
  }

  const data = getData();

  dm.allMembers = dm.allMembers.filter(user => user !== uId);
  setData(data);
  addStats(uId);

  return {};
};

/**
 * Find the DM information, given the DM ID
 *
 * @param {number} dmId - ID of DM
 *
 * @returns {DMDetails} - dmId successfully found
 * @returns {undefined} - invalid dmId
 */
export const findDMFromId = (dmId: number) => {
  const dm = getData().dms.find(dm => dm.dmId === dmId);
  return (dm && dm.deleted) ? undefined : dm;
};

/**
 * Fetch the details for a DM
 *
 * @param authuserId - user fetching details
 * @param dmId - ID of DM
 */
export const dmDetails = (authuserId: number, dmId: number) => {
  const dm = findDMFromId(dmId);

  if (dm === undefined) {
    throw HTTPError(400, 'DM does not exist');
  }
  if (!dm.allMembers.includes(authuserId)) {
    throw HTTPError(403, 'User not member of DM');
  }

  return {
    name: dm.name,
    members: dm.allMembers.map(getUserObjectFromId)
  };
};

/**
 * Delete a DM
 *
 * @param authUserId - user deleting DM
 * @param dmId - ID of DM
 */
export const removeDM = (authUserId: number, dmId: number) => {
  const dm = findDMFromId(dmId);

  if (dm === undefined || dm.deleted) {
    throw HTTPError(400, 'DM does not exist');
  }
  if (dm.owner !== authUserId) {
    throw HTTPError(403, 'User not owner of DM');
  }
  if (!dm.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'User not member of DM');
  }

  const allMembers = dm.allMembers;

  (dm.dmId as null) = null;
  dm.deleted = true;
  dm.allMembers = [];

  // remove all dm messages in the message list
  for (const messageId of dm.messageIds) {
    getData().allMessages[messageId].deleted = true;
  }

  setData(getData());

  for (const user of allMembers) {
    addStats(user);
  }
  return {};
};

/**
 * List all DMs the user is a part of
 * @param authUserId - user
 */
export const listDMs = (uId: number) => {
  return {
    dms: getData().dms.filter(
      dm => !dm.deleted && dm.allMembers.includes(uId)
    ).map(dm => {
      return { dmId: dm.dmId, name: dm.name };
    })
  };
};

/**
 * Send a new message in a DM
 *
 * @param authUserId - ID of user sending message
 * @param dmId - ID of DM to send
 * @param message - message to send
 */
export const dmSend = (authUserId: number, dmId: number, message: string) => {
  return genericSendMessage(authUserId, findDMFromId(dmId), message, true);
};

/**
 * Send a delayed DM
 */
export const sendDMMessageLater = (
  authUserId: number, dmId: number, message: string, timeSent: number
) => {
  const channel = findDMFromId(dmId);
  return genericSendMessageLater(
    authUserId, channel, dmId, 'dms', message, timeSent
  );
};

/**
 * Fetch the messages in a given DM
 *
 * @param authUserId - user requesting the messages
 * @param dmId - ID of DM
 * @param start - offset from which to fetch the messages
 */
export const dmMessages = (authUserId: number, dmId: number, start: number) => {
  return genericListMessages(authUserId, findDMFromId(dmId), start);
};
