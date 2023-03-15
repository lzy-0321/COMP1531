import { getData } from './dataStore';
import { getUserObjectFromDetails } from './user';

/**
 * For a valid token returns a list of all users
 *
 * @param {string} token - the token of the user requesting to see all users
 *
 * @returns {user: {
 *   uId: number, email: string,
 *   nameFirst: string, nameLast: string, handleStr: string
 * } }} - the user profile} - description of condition for return
 *
 */
export const usersAllV1 = () => {
  const users = getData().users.filter(user => user.isActivated === true);

  return {
    users: users.map(getUserObjectFromDetails)
  };
};

/**
 * Fetches the required statistics about the workspace's use of UNSW Beans.
 * @param {} tokens
 * @returns - workspaceStats
 */
export const usersStatsV1 = () => {
  return {
    workspaceStats: getData().usersStats
  };
};
