import { findChannelFromId, hasChannelOwnershipPerms } from './channel';
import { getData, setData } from './dataStore';
import { ChannelDetails, DMDetails, Venue, DataStore, Message, VenueName, React, ReactOutput } from './types';
import { addStats } from './user';
import HTTPError from 'http-errors';
import { findDMFromId } from './dm';
import { getUserByHandle } from './auth';

/**
 * Return current UNIX time
 */
export const currentUNIXTime = () => Date.now() / 1000;

/**
 * Make an empty react for a new message
 */
export const makeDefaultReact = (): React[] => {
  return [{
    reactId: 1,
    uIds: [],
  }];
};

/**
 * Send a message in a channel or DM
 * @param uId - user sending message
 * @param venue - channel or DM
 * @param message - message to send
 */
export const genericSendMessage = (
  uId: number, venue: Venue, message: string, doNotifications: boolean
) => {
  if (!venue) {
    throw HTTPError(400, 'invalid channel/dm id');
  }

  if (!venue.allMembers.includes(uId)) {
    throw HTTPError(403, 'user not member of channel/dm');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message size');
  }

  const data = getData();

  const messageId = data.allMessages.length;
  const timeSent = currentUNIXTime();
  const messageObj = {
    message,
    uId,
    messageId,
    timeSent,
    deleted: false,
    isPinned: false,
    reacts: makeDefaultReact()
  };

  data.allMessages.push(messageObj);
  venue.messageIds.push(messageId);
  setData(data);

  if (doNotifications) {
    handleMesageNotifications(messageObj, venue, message);
  }

  addStats(uId);

  return { messageId };
};

/**
 * Trigger notifications for tagged users in a message
 */
export const handleMesageNotifications = (message: Message, venue: Venue, tagContents: string) => {
  const notifiedUsers: number[] = [];

  Array.from(tagContents.matchAll(/@([a-zA-Z0-9]+)/g)).forEach(match => {
    const taggedHandle = match[1];

    const senderUser = getData().users.find(user => user.uID === message.uId);
    const taggedUser = getUserByHandle(taggedHandle);
    if (!taggedUser || !venue.allMembers.includes(taggedUser.uID)) {
      return;
    }
    if (notifiedUsers.includes(taggedUser.uID)) {
      return;
    }

    notifiedUsers.push(taggedUser.uID);

    let notifyMessage = `${senderUser.handleStr} tagged you in `;
    notifyMessage += `${venue.name}: ${message.message.slice(0, 20)}`;

    const notificationObj = {
      channelId: (venue as ChannelDetails).channelId || -1,
      dmId: (venue as DMDetails).dmId || -1,
      notificationMessage: notifyMessage
    };

    const data = getData();
    taggedUser.notifications.push(notificationObj);
    setData(data);
  });
};

/**
 * Send a message later in a channel or DM
 * @param uId - user sending message
 * @param venue - channel or DM
 * @param message - message to send
 */
export const genericSendMessageLater = (
  uId: number, venue: Venue, venueId: number, venueType: VenueName,
  message: string, timeSent: number
) => {
  if (!venue) {
    throw HTTPError(400, 'invalid channel/dm id');
  }

  if (!venue.allMembers.includes(uId)) {
    throw HTTPError(403, 'user not member of channel/dm');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message size');
  }

  if (timeSent < currentUNIXTime()) {
    throw HTTPError(400, 'scheduled time is in the past');
  }

  const data = getData();

  const messageId = data.allMessages.length;
  const messageObj = {
    message,
    uId,
    messageId,
    timeSent,
    deleted: false,
    isPinned: false,
    reacts: makeDefaultReact()
  };

  data.allMessages.push(null);

  data.scheduledMessages.push({
    message: messageObj, messageId, timeSent, venueId, venueType
  });

  setData(data);

  // In case this message needs to be sent right now
  handleScheduledMessages();

  return { messageId };
};

/**
 * Send any outstanding scheduled messages
 */
export const handleScheduledMessages = () => {
  const data = getData();
  const now = currentUNIXTime();

  const allSent: number[] = [];

  data.scheduledMessages.filter(
    scheduled => scheduled.timeSent <= now
  ).forEach(scheduled => {
    allSent.push(scheduled.messageId);

    const venue = ({
      channels: findChannelFromId,
      dms: findDMFromId
    }[scheduled.venueType])(scheduled.venueId);

    if (!venue || (venue as DMDetails).deleted) {
      return;
    }

    venue.messageIds.push(
      scheduled.messageId
    );
    data.allMessages[scheduled.messageId] = scheduled.message;

    handleMesageNotifications(
      scheduled.message, venue, scheduled.message.message
    );

    addStats(scheduled.message.uId);
  });

  data.scheduledMessages = data.scheduledMessages.filter(
    scheduled => !allSent.includes(scheduled.messageId)
  );

  if (allSent.length > 0) {
    setData(data);
  }

  return Math.min(...data.scheduledMessages.map(
    scheduled => scheduled.timeSent - now
  )) * 1000;
};

/**
 * Fetch the messages in either a channel or a DM
 *
 * @param uId - user listing messages
 * @param venue - channel/DM
 * @param start - index from which to fetch messages
 */
export const genericListMessages = (uId: number, venue: Venue, start: number) => {
  if (venue === undefined) {
    throw HTTPError(400, 'channel/dm does not exist');
  }

  if (!venue.allMembers.includes(uId) && getData().users.find(user => user.uID === uId).isActivated === true) {
    throw HTTPError(403, 'user not member of channel/dm');
  }

  if (start > venue.messageIds.length) {
    throw HTTPError(400, 'start is too big');
  }

  const data = getData();

  // Find the non-deleted messages in reverse-chronological order
  const reversedMessages = venue.messageIds.map(
    id => data.allMessages[id]
  ).reverse().filter(message => message && !message.deleted);

  const result: Message[] = [];
  let reachedLastMessage = false;

  const indices = Array(50).fill(null).map((v, i) => i + start);

  indices.forEach(i => {
    if (i < reversedMessages.length) {
      const message = { ...reversedMessages[i] };

      // We shouldn't respond back with the fact the message wasn't deleted
      delete message.deleted;
      result.push(setIsReacted(message, uId));
    }

    if (i >= reversedMessages.length - 1) {
      reachedLastMessage = true;
    }
  });

  return {
    messages: result,
    start,
    end: reachedLastMessage ? -1 : start + 50
  };
};

/**
 * Checks whether a user is an owner of a venue
 *
 * @param venue - the venue to check
 * @param uId - the user to check
 * @returns {boolean}
 */
const isVenueOwner = (venue: Venue, uId: number) => {
  const asChannel = venue as ChannelDetails;
  const asDM = venue as DMDetails;

  if (asChannel.ownerMembers) {
    return hasChannelOwnershipPerms(asChannel, uId);
  } else {
    return asDM.owner === uId && !asDM.deleted;
  }
};

/**
 * removes a message from a channel or dm sent by the user
 *
 * @param uId - user requesting for the message removal
 * @param messageId - id of the message that is to be removed
 * @returns {} - success
 * @return { error: string } - error
 */
export const removeMessageV1 = (uId: number, messageId: number) => {
  const data = getData();

  const channels: Venue[] = data.channels;
  const dms = data.dms;

  for (const venue of channels.concat(dms)) {
    if ((venue as DMDetails).deleted) {
      continue;
    }

    if (!venue.messageIds.includes(messageId) || !venue.allMembers.includes(uId)) {
      continue;
    }

    const message = data.allMessages[messageId];
    if (!message || message.deleted) {
      continue;
    }

    if (!isVenueOwner(venue, uId) && message.uId !== uId) {
      throw HTTPError(403, 'you are not allowed to delete this message');
    }

    message.deleted = true;
    venue.messageIds = venue.messageIds.filter(id => id !== messageId);
    setData(data);
    addStats(uId);

    return {};
  }

  throw HTTPError(400, 'message id not found');
};

/**
 * finds a message given its id
 *
 * @param data - dataStore
 * @param messageId - id of the message
 * @returns - the message object
 */
export const findMessageFromId = (data: DataStore, messageId: number) => {
  const message = data.allMessages[messageId];
  return (message?.deleted) ? undefined : message;
};

/**
 * edits a message in a channel/dm
 *
 * @param authUserId - id of the user editting the message
 * @param messageId - id of the message to be editted
 * @param message - new message
 * @returns {} - success
 * @returns { error: string } - on error
 */
export const editMessageV1 = (authUserId: number, messageId: number, message: string) => {
  const data = getData();

  if (message.length > 1000) {
    throw HTTPError(400, 'message is too long');
  }

  const oldMessage = findMessageFromId(data, messageId);

  const channels = data.channels as Venue[];
  const dms = data.dms as Venue[];
  const venue = channels.concat(dms).find(
    venue => venue.messageIds.includes(messageId)
  );

  if (!oldMessage || !venue || oldMessage.deleted) {
    throw HTTPError(400, 'message not found');
  }

  if (oldMessage.uId !== authUserId && !isVenueOwner(venue, authUserId)) {
    throw HTTPError(403, 'user is not authorised to edit this message');
  }

  if (message === '') {
    return removeMessageV1(authUserId, messageId);
  }

  oldMessage.message = message;
  setData(data);

  handleMesageNotifications(oldMessage, venue, message);

  return {};
};

/**
 * Pins a message from a channel or dm
 *
 * @param authUserId - id of the user pinning the message
 * @param messageId - id of the message to be pinned
 * @returns {}
 */
export const messagePinV1 = (authUserId: number, messageId: number) => {
  const data = getData();

  const message = findMessageFromId(data, messageId);

  const channels = data.channels as Venue[];
  const dms = data.dms as Venue[];
  const venue = channels.concat(dms).find(
    venue => venue.messageIds.includes(messageId)
  );

  if (message === undefined || venue === undefined) {
    throw HTTPError(400, 'message not found');
  }
  if (message.isPinned === true) {
    throw HTTPError(400, 'message is already pinned');
  }

  if (!isVenueOwner(venue, authUserId)) {
    throw HTTPError(403, 'user is not authorised to pin this message');
  }

  message.isPinned = true;
  setData(data);

  return {};
};

/**
 * Unpins a message from a channel or dm
 *
 * @param authUserId - id of the user unpinning the message
 * @param messageId - id of the message to be unpinned
 * @returns {}
 */
export const messageUnpinV1 = (authUserId: number, messageId: number) => {
  const data = getData();

  const message = findMessageFromId(data, messageId);

  const channels = data.channels as Venue[];
  const dms = data.dms as Venue[];
  const venue = channels.concat(dms).find(
    venue => venue.messageIds.includes(messageId)
  );

  if (message === undefined || venue === undefined) {
    throw HTTPError(400, 'message not found');
  }
  if (message.isPinned === false) {
    throw HTTPError(400, 'message is not already pinned');
  }

  if (!isVenueOwner(venue, authUserId)) {
    throw HTTPError(403, 'user is not authorised to pin this message');
  }

  message.isPinned = false;
  setData(data);

  return {};
};

/**
 * finds a channel in which a particular message is sent
 *
 * @param messageId - id of message
 * @returns channel on success
 * @returns false otherwise
 */
export const findChannelfromMessageId = (messageId: number) => {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.messageIds.includes(messageId)) {
      return channel;
    }
  }
  return false;
};

/**
 * finds a dm in which a particular message is sent
 *
 * @param messageId - id of message
 * @returns dm on success
 * @returns false otherwise
 */
export const findDMfromMessageId = (messageId: number) => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.deleted === false && dm.messageIds.includes(messageId)) {
      return dm;
    }
  }
  return false;
};

/**
 * checks if an user is in a channel or dm in which a particular message is sent
 *
 * @param messageId - id of message
 * @returns true if user can see the message
 * @returns false otherwise
 */
export const canUserSeeMessage = (authUserId: number, messageId: number) => {
  const channel = findChannelfromMessageId(messageId);
  const dm = findDMfromMessageId(messageId);
  if (channel !== false && channel.allMembers.includes(authUserId)) {
    return true;
  }
  if (dm !== false && dm.allMembers.includes(authUserId)) {
    return true;
  }
  return false;
};

/**
 * searches for all messages which contains a given query
 *
 * @param authUserId- id of user
 * @param queryString - query
 * @returns matches - array of messages which match the query
 */
export const searchV1 = (authUserId: number, queryString: string) => {
  const data = getData();

  if (queryString.length < 1 || queryString.length > 1000) {
    throw HTTPError(400, 'query must be between 1 and 1000 character long');
  }

  const messages = data.allMessages as Message[];
  const matches = [];
  for (const message of messages) {
    if (message && message.message.includes(queryString) && canUserSeeMessage(authUserId, message.messageId)) {
      matches.push({
        messageId: message.messageId,
        uId: message.uId,
        message: message.message,
        timeSent: message.timeSent,
        reacts: message.reacts,
        isPinned: message.isPinned
      });
    }
  }

  return { messages: matches.map(setIsReacted) };
};

/**
 * Find the venue for a given message
 */
const getVenueFromMessageId = (messageId: number) => {
  const data = getData();

  const channels = data.channels as Venue[];
  const dms = data.dms as Venue[];
  return channels.concat(dms).find(
    venue => venue.messageIds.includes(messageId)
  );
};

/**
 * reacts to a message in a dm or channel
 *
 * @param authUserId- id of user
 * @param messageId - id of the message to be pinned
 * @param reactId - id of the react being used
 * @returns {}
 */
export const messageReactV1 = (authUserId: number, messageId: number, reactId: number) => {
  const data = getData();

  const message = data.allMessages[messageId];
  const venue = getVenueFromMessageId(messageId);

  if (!message || !venue) {
    throw HTTPError(400, 'message not found');
  }

  if (!venue.allMembers.includes(authUserId)) {
    throw HTTPError(400, 'user not authorised to react');
  }

  const react = message.reacts.find(
    react => react.reactId === reactId
  );

  if (!react) {
    throw HTTPError(400, 'invalid react');
  }

  if (react.uIds.includes(authUserId)) {
    throw HTTPError(400, 'already reacted');
  }

  react.uIds.push(authUserId);
  setData(data);

  const reactingUser = getData().users.find(user => user.uID === authUserId);
  const senderUser = getData().users.find(user => user.uID === message.uId);

  const notifyMessage = `${reactingUser.handleStr} reacted to your message in ${venue.name}`;
  senderUser.notifications.push({
    channelId: (venue as ChannelDetails).channelId || -1,
    dmId: (venue as DMDetails).dmId || -1,
    notificationMessage: notifyMessage
  });

  return {};
};

/**
 * Unreacts to a react in a dm or channel
 *
 * @param authUserId- id of user
 * @param messageId - id of the message to be pinned
 * @param reactId - id of the react being used
 * @returns {}
 */
export const messageUnreactV1 = (authUserId: number, messageId: number, reactId: number) => {
  const data = getData();

  const message = data.allMessages[messageId];
  const venue = getVenueFromMessageId(messageId);

  if (!message || !venue) {
    throw HTTPError(400, 'message not found');
  }

  if (!venue.allMembers.includes(authUserId)) {
    throw HTTPError(400, 'user not authorised to react');
  }

  const react = message.reacts.find(
    react => react.reactId === reactId
  );

  if (!react) {
    throw HTTPError(400, 'invalid react');
  }

  if (!react.uIds.includes(authUserId)) {
    throw HTTPError(400, 'nothing to unreact to');
  }

  react.uIds = react.uIds.filter(uId => uId !== authUserId);
  setData(data);

  return {};
};

/**
 * Return a deep clone of a message
 */
const deepCloneMessage = (obj: Message) => JSON.parse(JSON.stringify(obj));

/**
 * Set the isThisUserReacted for a message
 */
export const setIsReacted = (message: Message, uId: number) => {
  message = deepCloneMessage(message);
  message.reacts.forEach(react => {
    (react as ReactOutput).isThisUserReacted = react.uIds.includes(uId);
  });
  return message;
};

/**
 * Share a message
 */
export const messageShareV1 = (authUserId: number, ogMessageId: number, message: string, channelId: number, dmId: number) => {
  const data = getData();

  const ogMessage = findMessageFromId(data, ogMessageId);
  const ogVenue = getVenueFromMessageId(ogMessageId);

  if (!ogMessage || !ogVenue || !ogVenue.allMembers.includes(authUserId)) {
    throw HTTPError(400, 'invalid message');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message size');
  }

  const channel = findChannelFromId(channelId);
  const dm = findDMFromId(dmId);

  const venue = channel || dm;

  if ((dmId !== -1) === (channelId !== -1) || !venue) {
    throw HTTPError(400, 'one of channelId or dmId should be -1');
  }

  if (!venue.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'not authorised to share into that chanen');
  }

  const oldMessage = message;
  message = `${message}:\n >> ${ogMessage.message}`;

  const { messageId } = genericSendMessage(authUserId, venue, message, false);

  handleMesageNotifications(data.allMessages[messageId], venue, oldMessage);

  return { sharedMessageId: messageId };
};

/**
 * Return last 20 notifications for a user
 */
export const notificationsGetV1 = (authUserId: number) => {
  const user = getData().users.find(user => user.uID === authUserId);
  const notification = [...user.notifications].reverse().slice(0, 20);

  return { notifications: notification };
};
