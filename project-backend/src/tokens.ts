import { createHash, randomInt } from 'crypto';
import { getData, setData } from './dataStore';

/**
 * Hash a token
 */
export const hashToken = (token: string) => {
  const hash = createHash('sha256');
  return hash.update(token).digest('base64');
};

/**
 * Returns the user ID that a given token is associated with
 *
 * @param {string} token - the token to check
 *
 * @returns {number} - the user ID
 * @returns {null} - invalid token
 */
export const getUserIdFromToken = (token: string) => (
  getData().issuedTokens[hashToken(token)] || null
);

/**
 * Generate a randomised string of letters
 *
 * @param {number} numChars - number of characters in string
 * @returns {string} - random string
 */
export const generateRandomString = (numChars: number) => {
  return new Array(numChars).fill(null).map(() => {
    let alphabet = 'abcdefghijklmnopqrstuvwxyz';
    alphabet += alphabet.toUpperCase();
    return alphabet[randomInt(alphabet.length)];
  }).join('');
};

/**
 * Create a new token for a given uId
 *
 * @param {number} uId - user to issue token for
 * @returns {string} - new token
 */
export const issueToken = (uId: number): string => {
  const token = generateRandomString(32);

  const data = getData();
  data.issuedTokens[hashToken(token)] = uId;
  setData(data);

  return token;
};

/**
 * Given an active token, invalidates the token to log the user out
 * @param {string} token - token to invalidate
 */
export const invalidateToken = (token: string) => {
  const data = getData();
  delete data.issuedTokens[hashToken(token)];
  setData(data);

  return {};
};
