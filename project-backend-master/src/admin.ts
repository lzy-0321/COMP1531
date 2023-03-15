import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

/**
 * Given a user by their uId, removes them from the Beans. This means they should be removed from all channels/DMs, and will not be included in the array of users returned by users/all
 *
 * @param {number} authUserId - the user make the call
 * @param {number} uId - the user to be removed
 * @returns {{}} - empty object
 * @returns {{ error: string }} - the uId was invalid
 * @returns {{ error: string }} - the uId refers to a user who is the only global owner
 */
export const adminUserRemoveV1 = (authUserId: number, uId: number) => {
  const data = getData();
  const userCalled = data.users.find(user => user.uID === authUserId);
  const userRemoved = data.users.find(user => user.uID === uId && user.isActivated === true);

  if (!userRemoved) {
    throw HTTPError(400, 'Invalid uId');
  }
  if (data.users.filter(user => user.isGlobalOwner === 1).length === 1 && userRemoved.isGlobalOwner === 1) {
    throw HTTPError(400, 'Cannot remove last global owner');
  }
  if (userCalled.isGlobalOwner === 2) {
    throw HTTPError(403, 'Only global owners can remove users');
  }
  userRemoved.nameFirst = 'Removed';
  userRemoved.nameLast = 'user';
  userRemoved.isGlobalOwner = 2;
  userRemoved.isActivated = false;
  authLogout(uId);
  for (const channel of data.channels) {
    channel.ownerMembers = channel.ownerMembers.filter(member => member !== uId);
    channel.allMembers = channel.allMembers.filter(member => member !== uId);
  }
  for (const dm of data.dms) {
    dm.allMembers = dm.allMembers.filter(member => member !== uId);
    if (dm.owner === uId) {
      dm.owner = -1;
    }
  }
  for (const message of data.allMessages) {
    if (message.uId === uId) {
      message.message = 'Removed user';
    } else {
      continue;
    }
  }
  setData(data);
  return {};
};

/**
 * Given a user by their uID, sets their permissions to new permissions described by permissionId.
 * @param {number} authUserId - the user make the call
 * @param {number} uId - the user to be given new permissions
 * @param {number} permissionId - the new permissions to be given to the user
 * @returns {{}} - empty object
 * @returns {{ error: string }} - the uId was invalid
 * @returns {{ error: string }} - the uId refers to a user who is the only global owner
 * @returns {{ error: string }} - the permissionId was invalid
 * @returns {{ error: string }} - the authUserId does not have permission to change the permissions of the user
 */

/**
 * Set the global owner permission for a user
 */
export const adminUserPermissionsV1 = (authUserId: number, uId: number, permissionId: number) => {
  const data = getData();
  const userCalled = data.users.find(user => user.uID === authUserId);
  const userChanged = data.users.find(user => user.uID === uId && user.isActivated === true);

  if (!userChanged) {
    throw HTTPError(400, 'Invalid uId');
  }
  if (userCalled.isGlobalOwner === 2) {
    throw HTTPError(403, 'Only global owners can change permissions');
  }
  if (data.users.filter(user => user.isGlobalOwner === 1).length === 1 && authUserId === uId) {
    throw HTTPError(400, 'Cannot change permissions of last global owner');
  }
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permissionId');
  }
  const permission = userChanged.isGlobalOwner;
  if (permission === permissionId) {
    throw HTTPError(400, 'User already has that permission');
  }

  userChanged.isGlobalOwner = permissionId;
  setData(data);
  return {};
};

/**
 * logs out a user
 * @param {number} uId - the user to be logged out
 * @returns {{}} - empty object
*/
export const authLogout = (uId: number) => {
  const data = getData();
  const allTokens = data.issuedTokens;
  for (const token in allTokens) {
    if (allTokens[token] === uId) {
      delete allTokens[token];
    }
  }
  setData(data);
};
