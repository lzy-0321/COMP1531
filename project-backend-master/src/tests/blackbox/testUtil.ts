import request, { HttpVerb } from 'sync-request';
import { expect } from '@jest/globals';
import config from '../../config.json';
import { reqAuthRegister, reqClear } from './testWrappers';

const SERVER_URL = `${config.url}:${config.port}`;

/**
 * A convenience function which wraps around sync-request in a nice way.
 *
 * @param method - the HTTP method (e.g. GET, DELETE, etc.)
 * @param endpoint - the endpoint (e.g. "/clear/v1")
 * @param data - the payload as an object
 * @returns {object} - got successful response, converted to JSON
 */
export const makeRequest = (method: HttpVerb, endpoint: string, data: any) => {
  if (!endpoint.startsWith('/')) {
    throw new Error('missing leading slash!');
  }

  const token = data.token || null;
  if (token) {
    delete data.token;
  }

  const response = request(
    method, SERVER_URL + endpoint, {
      qs: ['GET', 'DELETE'].includes(method) ? data : {},
      json: ['PUT', 'POST'].includes(method) ? data : {},
      headers: token
        ? { token: token }
        : {}
    }
  );

  if (response.statusCode === 400) {
    return 400;
  }
  if (response.statusCode === 403) {
    return 403;
  }

  // Throw errors for when the status code is not OK or we don't get an object,
  // since that should never occur for a conforming implementation. We don't
  // want to use expect(...) here since we don't know if we're being run inside
  // of a jest test.
  if (response.statusCode !== 200) {
    throw new Error(
      `Response for ${method} was ${response.statusCode}: ${response.body}`
    );
  }

  const responseObject = JSON.parse(response.getBody('utf-8'));
  if (typeof responseObject !== 'object') {
    throw new Error(`Response for ${method} wasn't an object: ${responseObject}`);
  }

  return responseObject;
};

const testState = {
  userNum: 0, seenIds: <number[]>[]
};

/**
 * Add an ID to the list of known ID's (to help generate and invalid ID)
 */
export const addSeenId = (id: number) => {
  expect(id).toStrictEqual(expect.any(Number));
  testState.seenIds.push(id);
};

/**
 * Make an invalid ID for a test
 */
export const makeInvalidId = () => {
  expect(testState.seenIds.length > 0);
  const newId = Math.max(...testState.seenIds) + 1;
  expect(newId).toStrictEqual(expect.any(Number));
  expect(isNaN(newId)).toStrictEqual(false);
  addSeenId(newId);

  return newId;
};

/**
 * Reset state of tests
 */
export const resetTestState = () => {
  testState.userNum = 0;
  testState.seenIds = [];
  reqClear();
};

interface RegistrationResult {
  token: string,
  authUserId: number
}

/**
 * Make a new user, without needing to specify their details
 */
export const simpleRegisterUser = (): RegistrationResult => {
  const newUser = reqAuthRegister({
    email: `user${testState.userNum}@example.com`,
    password: `password${testState.userNum}`,
    nameFirst: `F${testState.userNum}`,
    nameLast: `L${testState.userNum}`
  });
  testState.userNum++;

  expect(newUser).toEqual({
    authUserId: expect.any(Number), token: expect.any(String)
  });

  return newUser;
};

interface MakeUsersReturn {
    tokenGlobalOwner: string;
    token1: string;
    token2: string;
    token3: string;
    uIdGlobalOwner: number;
    uId1: number;
    uId2: number;
    uId3: number;
}

/**
 * Create a batch of test users
 */
export const makeTestUsers = (): MakeUsersReturn => {
  const {
    token: tokenGlobalOwner, authUserId: uIdGlobalOwner
  } = simpleRegisterUser();

  // Intercept accesses to the user set to register users on demand
  return new Proxy({
    tokenGlobalOwner, uIdGlobalOwner,
  }, {
    get(target: any, prop: string) {
      if (prop.endsWith('Owner')) {
        return target[prop];
      }

      const needed = parseInt(prop.match(/\d+/)[0]);
      Array(needed).fill(null).forEach((v, i) => {
        // for each user number, check if they haven't already been
        // generated, and if they haven't, register them.
        if (!target[`token${i + 1}`]) {
          const { token, authUserId } = simpleRegisterUser();
          target[`token${i + 1}`] = token;
          target[`uId${i + 1}`] = authUserId;
        }
      });

      return target[prop];
    }
  });
};

/**
 * Create an invalid token
 */
export const makeInvalidToken = () => {
  const token = '<<invalid token>>';
  return token;
};

/**
 * Calculate UNIX time, for testing
 *
 * @returns - unix time
 */
export const unixTimeNow = () => Math.floor(Date.now() / 1000);
