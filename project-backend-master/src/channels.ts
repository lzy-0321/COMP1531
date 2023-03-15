import { getData, setData } from './dataStore';
import { ChannelDetails } from './types';
import { addStats } from './user';
import HTTPError from 'http-errors';

/**
 * Get a unique channel ID
 *
 * @return {number} - the unique channel ID
 */
const getUniqueChannelId = () => {
  return getData().channels.length + 1;
};

/**
 * Creates a new channel
 *
 * @param {number} authUserId - user creating channel
 * @param {string} name - name of channel
 * @param {boolean} isPublic - whether or not channel is public
 * @returns {{ channelId: number }} - new ID of channel
 */
export const channelsCreateV1 = (authUserId: number, name: string, isPublic: boolean) => {
  if (name.length < 1) {
    throw HTTPError(400, 'name too short');
  }

  if (name.length > 20) {
    throw HTTPError(400, 'name too long');
  }

  const newChannel: ChannelDetails = {
    channelId: getUniqueChannelId(),
    name: name,
    isPublic: isPublic,
    messageIds: [],
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    activeStandup: null
  };

  const data = getData();
  data.channels.push(newChannel);
  setData(data);
  addStats(authUserId);

  return { channelId: newChannel.channelId };
};

/**
 * Summarise the details of a channel
 * @param channel - the channel to summarise
 */
const getChannelSummary = (channel: ChannelDetails) => {
  return {
    channelId: channel.channelId,
    name: channel.name,
  };
};

/**
 * List the channels the user has access to
 *
 * @param {number} authUserId - user making request
 * @returns {{ channels: { channelId: number, name: string }[] }} - the channels
 */
export const channelsListV1 = (authUserId: number) => {
  return {
    channels: getData().channels.filter(
      channel => channel.allMembers.includes(authUserId)
    ).map(getChannelSummary)
  };
};

/**
 * Returns details of all channels a user is a member of
 *
 * @param {integer} authUserId
 * @returns {
 *   channels: Array <{
 *     channelId: number,
 *     name: string,
 *   }>
 * }
 */
export const channelsListAllV1 = () => {
  return {
    channels: getData().channels.map(getChannelSummary)
  };
};
