import { getUserByEmail } from './auth';
import { getData, setData } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import { UserDetails } from './types';
import { getProfileUrl } from './profileImage';

/**
 * Return the user profile information from an ID
 */
export const getUserObjectFromId = (uId: number) => {
  return getUserObjectFromDetails(
    getData().users.find(user => user.uID === uId)
  );
};

/**
 * Return the user profile information from a user details object
 */
export const getUserObjectFromDetails = (user: UserDetails) => {
  return {
    uId: user.uID,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: getProfileUrl(user.uID)
  };
};

/**
 * For a valid user, returns information about their user ID, email, first name,
 * last name, and handle.
 *
 * @param {number} authUserId - the user making the call
 * @param {number} uId - the user who's profile should be returned
 * @returns {{ user: {
 *   uId: number, email: string,
 *   nameFirst: string, nameLast: string, handleStr: string
 * } }} - the user profile
 * @returns {{ error: string }} - the authUserId or uId was invalid
 */
export const userProfileV1 = (authUserId: number, uId: number) => {
  const user = getData().users.find(user => user.uID === uId);

  if (user === undefined) {
    throw HTTPError(400, 'invalid uId');
  }

  return {
    user: getUserObjectFromDetails(user)
  };
};

/**
 * Update the authorised user's first and last name.
 * @param {number} authUserId - the user making the call
 * @param {string} nameFirst - the user's new first name
 * @param {string} nameLast - the user's new last name
 * @returns {{}} - empty object
 * @returns {{ error: string }} - the authUserId was invalid
 * @returns {{ error: string }} - the nameFirst or nameLast was too long or too short
 */
export const setNameV1 = (authUserId: number, nameFirst: string, nameLast: string) => {
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'first name must be between 1 and 50 chars');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'last name must be between 1 and 50 chars');
  }

  const data = getData();
  const user = data.users.find(user => user.uID === authUserId);

  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);

  return {};
};

/**
 * Update the authorised user's email.
 * @param {number} authUserId - the user making the call
 * @param {string} email - the user's new email
 * @returns {{}} - empty object
 * @returns {{ error: string }} - the authUserId was invalid
 * @returns {{ error: string }} - the email was invalid
 * @returns {{ error: string }} - the email was already in use
 */
export const setEmailV1 = (authUserId: number, email: string) => {
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email');
  }

  const data = getData();
  const user = data.users.find(user => user.uID === authUserId);

  if (getUserByEmail(email) !== null && email !== user.email) {
    throw HTTPError(400, 'email already in use');
  }

  user.email = email;
  setData(data);

  return {};
};

/**
 * Update the authorised user's handle.
 * @param {number} authUserId - the user making the call
 * @param {string} handleStr - the user's new handle
 * @returns {{}} - empty object
 * @returns {{ error: string }} - the authUserId was invalid
 * @returns {{ error: string }} - the handleStr was invalid
 * @returns {{ error: string }} - the handleStr was already in use
 * @returns {{ error: string }} - the handleStr was too long or too short
 */
export const setHandleV1 = (authUserId: number, handleStr: string) => {
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'handle must be between 3 and 20 chars');
  }

  if (!/^[a-zA-Z0-9]+$/.test(handleStr)) {
    throw HTTPError(400, 'handle must be alphanumeric');
  }

  const userWithHandle = getData().users.find(
    user => user.handleStr === handleStr
  );
  if (userWithHandle !== undefined && userWithHandle.uID !== authUserId) {
    throw HTTPError(400, 'handle already in use');
  }

  const data = getData();
  const user = data.users.find(user => user.uID === authUserId);

  user.handleStr = handleStr;
  setData(data);

  return {};
};

/**
 * Fetches the required statistics about this user's use of UNSW Beans.
 * @param {number} authUserId - the user making the call
 * @returns - the user's statistics
 */
export const userStatsV1 = (authUserId: number) => {
  const stats = getData().users.find(user => user.uID === authUserId).userStats;
  return { userStats: stats };
};

/**
 * help function to get the user's stats and users's stats
 * @param {number} authUserId - the user making the call
 * @returns {}
 */
export const addStats = (authUserId: number) => {
  const data = getData();

  const user = data.users.find(user => user.uID === authUserId);
  const userStats = user.userStats;
  const usersStats = data.usersStats;

  const numChannelsJoined = data.channels.filter(
    channel => channel.allMembers.includes(authUserId)
  ).length;
  const numDmsJoined = data.dms.filter(
    dm => dm.allMembers.includes(authUserId)
  ).length;
  const numMessagesSent = data.allMessages.filter(
    message => message && message.uId === authUserId
  ).length;
  const channelsExist = data.channels.length;
  const dmsExist = data.dms.filter(
    dm => dm.deleted === false
  ).length;
  const messagesExist = data.allMessages.filter(
    message => message && message.deleted === false
  ).length;
  const numUsersWhoHaveJoinedAtLeastOneChannelOrDm = data.users.filter(
    user => data.channels.filter(
      channel => channel.allMembers.includes(user.uID)
    ).length > 0 || data.dms.filter(
      dm => dm.allMembers.includes(user.uID)
    ).length > 0
  ).length;

  const timeStamp = Math.floor(Date.now() / 1000);

  const appendIfNotDuplicate = (property: string, arr: {[name: string]: number}[], value: number) => {
    if (arr.length === 0 || arr[arr.length - 1][property] !== value) {
      arr.push({ [property]: value, timeStamp });
    }
  };

  appendIfNotDuplicate('numChannelsJoined', userStats.channelsJoined, numChannelsJoined);
  appendIfNotDuplicate('numDmsJoined', userStats.dmsJoined, numDmsJoined);
  appendIfNotDuplicate('numMessagesSent', userStats.messagesSent, numMessagesSent);
  appendIfNotDuplicate('numChannelsExist', usersStats.channelsExist, channelsExist);
  appendIfNotDuplicate('numDmsExist', usersStats.dmsExist, dmsExist);
  appendIfNotDuplicate('numMessagesExist', usersStats.messagesExist, messagesExist);

  usersStats.utilizationRate = numUsersWhoHaveJoinedAtLeastOneChannelOrDm / data.users.length;

  userStats.involvementRate = calculateInvolvement(
    numChannelsJoined, numDmsJoined, numMessagesSent, channelsExist, dmsExist
  );

  setData(data);

  return {};
};

/**
 * helper function to calculate The user's involvement
 * The user's involvement, as defined by this pseudocode: sum(numChannelsJoined, numDmsJoined, numMsgsSent)/sum(numChannels, numDms, numMsgs). If the denominator is 0, involvement should be 0. If the involvement is greater than 1, it should be capped at 1
 * @param {number} numChannelsJoined - the number of channels joined
 * @param {number} numDmsJoined - the number of dms joined
 * @param {number} numMessagesSent - the number of messages sent
 * @returns {number} - the user's involvement
 */
const calculateInvolvement = (
  numChannelsJoined: number,
  numDmsJoined: number,
  numMessagesSent: number,
  channelsExist: number,
  dmsExist: number
) => {
  const data = getData();

  const numChannels = channelsExist;
  const numDms = dmsExist;
  const numMsgs = data.allMessages.length;

  const denominator = numChannels + numDms + numMsgs;
  const numerator = numChannelsJoined + numDmsJoined + numMessagesSent;
  const involvement = denominator === 0 ? 0 : numerator / denominator;

  return Math.min(involvement, 1);
};
