import HTTPError from 'http-errors';
import axios from 'axios';
// import imageType from 'image-type';
import sharp from 'sharp';
import { join as joinPath } from 'path';
import config from './config.json';
import { readFileSync } from 'fs';

export const IMAGE_DIRECTORY = 'profile-pics';

/**
 * Return the path to a user's profile pic
 */
export const getProfilePath = (uId: number) => joinPath(
  IMAGE_DIRECTORY, `user-profile-${uId}.jpg`
);

/**
 * Return the path to the default profile pic
 */
const getDefaultProfilePath = () => joinPath(
  IMAGE_DIRECTORY, 'default.jpg'
);

/**
 * Upload a profile picture
 */
export const uploadPhoto = async (uId: number, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) => {
  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'end coordinate must be greater than start');
  }

  const response = await axios(imgUrl, {
    responseType: 'arraybuffer',
    validateStatus: status => true // validate status later
  });
  if (response.status !== 200) {
    throw HTTPError(400, 'non-OK status code');
  }

  const imageBuffer = new Uint8Array(await response.data);

  // const type = await imageType(imageBuffer);

  const metadata = await sharp(imageBuffer).metadata();
  if (!['jpeg', 'jpg'].includes(metadata.format)) {
    throw HTTPError(400, 'image must be jpeg');
  }

  if (xStart < 0 || xEnd >= metadata.width || yStart < 0 || yStart >= metadata.height) {
    throw HTTPError(400, 'coordinates are out of bounds');
  }

  await sharp(imageBuffer).extract({
    left: xStart,
    top: yStart,
    height: xEnd - xStart + 1,
    width: yEnd - yStart + 1
  }).toFile(getProfilePath(uId));

  return {};
};

let accesUrl = `http://${config.url}:${config.port}/`;

/**
 * Set the base express URL, from which profile image URL's are constructed
 */
export const setAccessUrl = (url: string) => {
  accesUrl = url;
};

/**
 * Construct the profile image URL
 */
export const getProfileUrl = (uId: number) => {
  return `${accesUrl}imageurl/${uId}`;
};

/**
 * Return the profile picture image contents for a given user id
 */
export const readProfileImage = (uId: number) => {
  try {
    return readFileSync(getProfilePath(uId));
  } catch {
    try {
      return readFileSync(getDefaultProfilePath());
    } catch {
      console.error('No default profile picture set!');
      return Buffer.from([]);
    }
  }
};
