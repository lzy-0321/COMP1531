import validator from 'validator';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { UserDetails } from './types';
import { addStats } from './user';
import { createHash } from 'crypto';

/**
 * Find the user with the corresponding email
 *
 * @param {string} email - email of user
 *
 * @returns {UserDetails} - if there's a user with the corresponding email
 * @returns {null} - if there is no user with the given email
 */
export const getUserByEmail = (email: string) => {
  const data = getData();

  return data.users.find(user => {
    return user.email.toLowerCase() === email.toLowerCase() && user.isActivated;
  }) || null;
};

/**
 * Returns a unique user ID
 *
 * @returns {number} - a new user ID
 */
const getUniqueUserId = () => getData().users.length + 1;

/**
 * Check if a handle is already taken
 *
 * @param {string} handle - the handle to check
 * @returns {boolean} - whether or not it is taken
 */
const handleExists = (handle: string) => {
  return getUserByHandle(handle) !== undefined;
};

/**
 * Find a user given their handle
 */
export const getUserByHandle = (handle: string) => {
  return getData().users.find(
    user => user.handleStr === handle && user.isActivated
  );
};

/**
 * Generates the handle for a newly created user
 *
 * @param {string} nameFirst - first name of user
 * @param {string} nameLast - last name of user
 *
 * @returns {string} - handle of user
 */
const generateHandle = (nameFirst: string, nameLast: string) => {
  let baseHandle = (nameFirst + nameLast).toLowerCase();
  baseHandle = baseHandle.replace(/[^a-zA-Z0-9]/g, '');
  baseHandle = baseHandle.slice(0, 20);

  if (!handleExists(baseHandle)) {
    return baseHandle;
  }

  let extraNumber = 0;
  while (handleExists(`${baseHandle}${extraNumber}`)) {
    extraNumber++;
  }

  return `${baseHandle}${extraNumber}`;
};

const PASSWORD_SALT = 'KDURtBhKPXgQGnvRMbPifQDVxJYbQXKa';

/**
 * Hash a password
 */
export const encryptPassword = (cleartext: string) => {
  const hash = createHash('sha256');
  return hash.update(cleartext + PASSWORD_SALT).digest('base64');
};

/**
 * Given a registered user's email and password, returns their authUserId value.
 *
 * @param {string} email - email of user
 * @param {string} password - password of user
 * @returns {{ authUserId: number }} - authUserId of corresponding user
 * @returns {{ error: string }} - email or password incorrect
 */
export const authLoginV1 = (email: string, password: string) => {
  const user = getUserByEmail(email);
  if (user === null) {
    throw HTTPError(400, 'user with given email not found');
  }

  if (user.passwordHash !== encryptPassword(password)) {
    throw HTTPError(400, 'password incorrect');
  }

  return { authUserId: user.uID };
};

/**
 * Registers a new user given their details
 *
 * @param {string} email - email of new user
 * @param {string} password - password of new user
 * @param {string} nameFirst - first name of new user
 * @param {string} nameLast - last name of new user
 *
 * @returns {{ authUserId: number }} - new authUserId of user
 * @returns {{ error: string }} - invalid details, or email already in use
 */
export const authRegisterV1 = (email: string, password: string, nameFirst: string, nameLast: string) => {
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email');
  }

  if (getUserByEmail(email) !== null) {
    throw HTTPError(400, 'email already in use');
  }

  if (password.length < 6) {
    throw HTTPError(400, 'password too short');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'first name must be between 1 and 50 chars');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'last name must be between 1 and 50 chars');
  }

  const data = getData();

  // All Beans users are global members by default, except for the very first user who signs up, who is a global owner
  const isGlobalOwner: 1 | 2 = data.users.length === 0 ? 1 : 2;

  const newUser: UserDetails = {
    uID: getUniqueUserId(),
    email: email,
    passwordHash: encryptPassword(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: generateHandle(nameFirst, nameLast),
    isGlobalOwner: isGlobalOwner,
    isActivated: true,
    userStats: {
      channelsJoined: [],
      dmsJoined: [],
      messagesSent: [],
      involvementRate: 0
    },
    notifications: []
  };

  data.users.push(newUser);
  setData(data);

  addStats(newUser.uID);

  return {
    authUserId: newUser.uID
  };
};

/**
 * Checks if the given authUserId is valid
 *
 * @param {number} authUserId - authUserId of user
 * @returns {true} - if authUserId is valid
 * @returns {false} - if authUserId is invalid
 */
export const authCheck = (authUserId: number) => {
  const data = getData();
  if (data.users.find(user => user.uID === authUserId) === undefined || !data.users.find(user => user.uID === authUserId).isActivated) {
    return false;
  }
  return true;
};
