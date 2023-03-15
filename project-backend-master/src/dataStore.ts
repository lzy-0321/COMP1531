import { DataStore, UsersStats } from './types';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { IMAGE_DIRECTORY } from './profileImage';
import { join } from 'path';

const PERSISTENCE_FILE_PATH = 'data.json';

/**
 * reset usersStats
 */
export const resetUsersStats = () => {
  const timeStamp = Math.floor(Date.now() / 1000);
  const usersStats: UsersStats = {
    channelsExist: [{ numChannelsExist: 0, timeStamp: timeStamp }],
    dmsExist: [{ numDmsExist: 0, timeStamp: timeStamp }],
    messagesExist: [{ numMessagesExist: 0, timeStamp: timeStamp }],
    utilizationRate: 0
  };
  return { usersStats };
};

let data: DataStore = {
  users: [],
  channels: [],
  issuedTokens: {},
  dms: [],
  allMessages: [],
  passwordResetCodes: {},
  scheduledMessages: [],
  ...resetUsersStats()
};

/**
 * Returns the datastore
 */
export const getData = () => data;

/**
 * Modify the datastore and trigger persistence
 */
export const setData = (newData: DataStore) => {
  data = newData;
  commitData();
};

/**
 * Perform persistence
 */
export const commitData = () => writeFileSync(
  PERSISTENCE_FILE_PATH,
  JSON.stringify(data), {
    encoding: 'utf-8'
  }
);

/**
 * Delete any uploaded profile pictures
 */
export const resetProfilePics = () => {
  readdirSync(IMAGE_DIRECTORY)
    .filter(file => file.startsWith('user-profile'))
    .forEach(file => unlinkSync(join(
      IMAGE_DIRECTORY, file
    )));
};

/**
 * Initialise the datastore with an empty state
 */
export const resetData = () => {
  resetProfilePics();
  setData({
    users: [],
    channels: [],
    issuedTokens: {},
    dms: [],
    allMessages: [],
    passwordResetCodes: {},
    scheduledMessages: [],
    ...resetUsersStats()
  });
};

/**
 * Initialise the data store from the stored persistence file
 */
export const initialiseData = () => {
  try {
    data = JSON.parse(readFileSync(PERSISTENCE_FILE_PATH, {
      encoding: 'utf-8'
    })) as DataStore;
    commitData();
  } catch (err) {
    resetData();
  }
};
