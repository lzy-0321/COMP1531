import { findChannelFromId } from './channel';
import HTTPError from 'http-errors';
import { commitData, getData, setData } from './dataStore';
import { currentUNIXTime, makeDefaultReact } from './messages';

/**
 * Start a standup
 */
export const startStandup = (initiator: number, channelId: number, length: number) => {
  const channel = findChannelFromId(channelId);

  if (!channel) {
    throw HTTPError(400, 'invalid channel');
  }

  if (length < 0) {
    throw HTTPError(400, 'negative length');
  }

  if (!channel.allMembers.includes(initiator)) {
    throw HTTPError(403, 'user not member of channel');
  }

  if (channel.activeStandup) {
    throw HTTPError(400, 'standup already active');
  }

  const finishTime = Math.floor(currentUNIXTime()) + length;
  channel.activeStandup = {
    finishTime: finishTime, // don't round for more accuracy
    initiator,
    messages: []
  };

  commitData();

  // In case length == 0
  handleScheduledStandups();

  return { timeFinish: Math.floor(finishTime) };
};

/**
 * Check if a standup is active in a channel
 */
export const standupActive = (authUserId: number, channelId: number) => {
  const channel = findChannelFromId(channelId);

  if (!channel) {
    throw HTTPError(400, 'invalid channel');
  }

  if (!channel.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user not member of channel');
  }

  if (channel.activeStandup) {
    return {
      isActive: true, timeFinish: Math.floor(channel.activeStandup.finishTime)
    };
  } else {
    return {
      isActive: false, timeFinish: null
    };
  }
};

/**
 * Send a standup message
 */
export const standupSend = (authUserId: number, channelId: number, message: string) => {
  const channel = findChannelFromId(channelId);

  if (!channel) {
    throw HTTPError(400, 'invalid channel');
  }

  if (!channel.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user not member of channel');
  }

  if (!channel.activeStandup) {
    throw HTTPError(400, 'no active standup');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message too long');
  }

  const user = getData().users.find(user => user.uID === authUserId);
  channel.activeStandup.messages.push({
    senderHandle: user.handleStr, contents: message
  });

  commitData();

  return {};
};

/**
 * Send all scheduled messages which need to be sent
 */
export const handleScheduledStandups = () => {
  const currentTime = currentUNIXTime();
  const data = getData();

  const channelsToBeHandled = data.channels.filter(
    ({ activeStandup }) => activeStandup && activeStandup.finishTime <= currentTime
  );

  channelsToBeHandled.forEach(channel => {
    if (channel.activeStandup.messages.length > 0) {
      const messageId = data.allMessages.length;

      const messageContents = channel.activeStandup.messages.map(
        message => `${message.senderHandle}: ${message.contents}`
      ).join('\n');

      data.allMessages.push({
        message: messageContents,
        uId: channel.activeStandup.initiator,
        messageId,
        timeSent: Math.floor(channel.activeStandup.finishTime),
        deleted: false,
        isPinned: false,
        reacts: makeDefaultReact()
      });
      channel.messageIds.push(messageId);
    }

    channel.activeStandup = null;
  });

  if (channelsToBeHandled.length > 0) {
    setData(data);
  }

  return Math.min(...data.channels.filter(channel => channel.activeStandup).map(
    channel => channel.activeStandup.finishTime - currentTime
  )) * 1000;
};
