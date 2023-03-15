import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';

import { authRegisterV1, authLoginV1 } from './auth';
import { clearV1 } from './other';
import { issueToken, getUserIdFromToken, invalidateToken } from './tokens';
import {
  createDM, dmDetails, dmMessages, dmSend,
  listDMs, removeDM, dmLeave, sendDMMessageLater
} from './dm';
import {
  userProfileV1, setNameV1,
  setEmailV1, setHandleV1, userStatsV1
} from './user';
import {
  removeMessageV1, editMessageV1, messagePinV1,
  messageUnpinV1, handleScheduledMessages, searchV1,
  messageReactV1, messageUnreactV1, messageShareV1, notificationsGetV1
} from './messages';
import { usersAllV1, usersStatsV1 } from './users';
import {
  channelsCreateV1, channelsListAllV1, channelsListV1
} from './channels';
import {
  channelDetailsV1, channelJoinV1, sendMessageV1, channelMessagesV1,
  channelInviteV1, channelAddownerV1, channelRemoveOwnerV1, channelLeave, sendChannelMessageLater
} from './channel';
import { adminUserRemoveV1, adminUserPermissionsV1 } from './admin';
import { initialiseData } from './dataStore';
import { readProfileImage, setAccessUrl, uploadPhoto } from './profileImage';
import { performPasswordReset, requestPasswordReset } from './passwordReset';
import { handleScheduledStandups, standupActive, standupSend, startStandup } from './standups';

initialiseData();

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

/**
 * Examine the token in a request and return a authUSerId
 */
const getUserIdFromRequest = (req: Request) => {
  setAccessUrl(
    `${req.protocol}://${req.header('host')}/${req.baseUrl}`
  );

  const token = req.header('token');
  const uid = getUserIdFromToken(token);
  if (uid === null) {
    throw HTTPError(403, 'invalid token');
  }
  return uid;
};

// Echo request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// Reset state
app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
});

// Log a user in
app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = authLoginV1(email, password);

  return res.json({
    token: issueToken(result.authUserId),
    authUserId: result.authUserId
  });
});

// Creating new channels
app.post('/channels/create/v3', (req: Request, res: Response) => {
  const { name, isPublic } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelsCreateV1(authUserId, name, isPublic));
});

// List channels that a user is a member of
app.get('/channels/list/v3', (req: Request, res: Response) => {
  const authUserId = getUserIdFromRequest(req);
  return res.json(channelsListV1(authUserId));
});

// Provide a list of all channels (with details channelId and name)
app.get('/channels/listAll/v3', (req: Request, res: Response) => {
  getUserIdFromRequest(req);
  return res.json(channelsListAllV1());
});

// Create new user
app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  const { authUserId } = authRegisterV1(email, password, nameFirst, nameLast);
  return res.json({
    authUserId, token: issueToken(authUserId)
  });
});

// Log a user out
app.post('/auth/logout/v2', (req: Request, res: Response) => {
  getUserIdFromRequest(req);
  return res.json(invalidateToken(req.header('token')));
});

// Request a password reset
app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;

  const useFake = req.header('user-agent') === undefined;

  requestPasswordReset(email, useFake).finally(() => {
    res.json({});
  });
});

// Use a password reset code
app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  res.json(performPasswordReset(resetCode, newPassword));
});

// Provide the details of a channel
app.get('/channel/details/v3', (req: Request, res: Response) => {
  const channelId = req.query.channelId as string;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelDetailsV1(authUserId, parseInt(channelId)));
});

// Adds an authorised user into a channel
app.post('/channel/join/v3', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelJoinV1(authUserId, channelId));
});

// invites another user to a channel the user is already a member of
app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelInviteV1(authUserId, channelId, uId));
});

// Create a new DM
app.post('/dm/create/v2', (req: Request, res: Response) => {
  const { uIds } = req.body;
  const uId = getUserIdFromRequest(req);

  return res.json(createDM(uId, uIds));
});

// Send a message
app.post('/message/send/v2', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const uId = getUserIdFromRequest(req);

  return res.json(sendMessageV1(uId, channelId, message));
});

// remove message from dm/channel
app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const messageId = req.query.messageId as string;
  const uId = getUserIdFromRequest(req);

  return res.json(removeMessageV1(uId, parseInt(messageId)));
});

// List messages
app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const { channelId, start } = req.query;
  const uId = getUserIdFromRequest(req);

  return res.json(channelMessagesV1(
    uId, parseInt(channelId as string), parseInt(start as string)
  ));
});

// Return user's profile
app.get('/user/profile/v3', (req: Request, res: Response) => {
  const uId = req.query.uId as string;
  const authUId = getUserIdFromRequest(req);

  return res.json(userProfileV1(authUId, parseInt(uId)));
});

// Make user with user id uId an owner of the channel
app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelAddownerV1(authUserId, parseInt(channelId), uId));
});

// Leave a channel
app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelLeave(authUserId, channelId));
});

// Return an array of the messages in a DM
app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const { dmId, start } = req.query;
  const authUserId = getUserIdFromRequest(req);

  return res.json(dmMessages(
    authUserId, parseInt(dmId as string), parseInt(start as string)
  ));
});

// Remove an owner
app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(channelRemoveOwnerV1(authUserId, parseInt(channelId), uId));
});

// Return the details for a particular DM
app.get('/dm/details/v2', (req: Request, res: Response) => {
  const { dmId } = req.query;
  const authUserId = getUserIdFromRequest(req);

  return res.json(dmDetails(authUserId, parseInt(dmId as string)));
});

// Remove a DM
app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const { dmId } = req.query;
  const authUserId = getUserIdFromRequest(req);

  return res.json(removeDM(authUserId, parseInt(dmId as string)));
});

// Return a list of all the DMs the user is a member of
app.get('/dm/list/v2', (req: Request, res: Response) => {
  const authUserId = getUserIdFromRequest(req);

  return res.json(listDMs(authUserId));
});

// Reset user's name
app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const { nameFirst, nameLast } = req.body;
  const uId = getUserIdFromRequest(req);

  return res.json(setNameV1(uId, nameFirst, nameLast));
});

// Reset user's email
app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const { email } = req.body;
  const uId = getUserIdFromRequest(req);

  return res.json(setEmailV1(uId, email));
});

// Reset user's handle
app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const { handleStr } = req.body;
  const uId = getUserIdFromRequest(req);

  return res.json(setHandleV1(uId, handleStr));
});

// Upload a profile pic
app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const uId = getUserIdFromRequest(req);

  uploadPhoto(uId, imgUrl, xStart, yStart, xEnd, yEnd).then(
    response => res.json(response)
  ).catch(err => {
    res.status(400).json({
      error: {
        message: err.message,
      },
    });
  });
});

app.get('/imageurl/:uId(\\d+)', (req: Request, res: Response) => {
  const uId = parseInt(req.params.uId);
  res.status(200).contentType('image/jpeg').end(
    readProfileImage(uId)
  );
});

// Sends a message in a DM
app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const { dmId, message } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(dmSend(authUserId, dmId, message));
});

// Sends a message later in a channel
app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const { channelId, message, timeSent } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(sendChannelMessageLater(
    authUserId, channelId, message, timeSent
  ));
});

// Send a DM later
app.post('/message/sendlaterdm/v1', (req: Request, res: Response) => {
  const { dmId, message, timeSent } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(sendDMMessageLater(
    authUserId, dmId, message, timeSent
  ));
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const { channelId, length } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(startStandup(
    authUserId, channelId, length
  ));
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const { channelId } = req.query;
  const authUserId = getUserIdFromRequest(req);

  return res.json(standupActive(
    authUserId, parseInt(channelId as string)
  ));
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(standupSend(
    authUserId, channelId, message
  ));
});

// Edits a message in a DM or channel
app.put('/message/edit/v2', (req: Request, res: Response) => {
  const { messageId, message } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(editMessageV1(authUserId, messageId, message));
});

// Shows all users
app.get('/users/all/v2', (req: Request, res: Response) => {
  getUserIdFromRequest(req);

  return res.json(usersAllV1());
});

// Removes user from DM
app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const { dmId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(dmLeave(authUserId, dmId));
});

app.post('/message/share/v1', (req: Request, res: Response) => {
  const { ogMessageId, message, channelId, dmId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(messageShareV1(authUserId, ogMessageId, message, channelId, dmId));
});

// admin remove user
app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const uId = req.query.uId as string;
  const authUId = getUserIdFromRequest(req);

  return res.json(adminUserRemoveV1(authUId, parseInt(uId)));
});

// admin change permission
app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const { uId, permissionId } = req.body as { uId: string, permissionId: string };
  const authUId = getUserIdFromRequest(req);

  return res.json(adminUserPermissionsV1(authUId, parseInt(uId), parseInt(permissionId)));
});

// Shows stats for a user
app.get('/user/stats/v1', (req: Request, res: Response) => {
  const authUserId = getUserIdFromRequest(req);
  return res.json(userStatsV1(authUserId));
});

// Marks a channel or DM as pinned
app.post('/message/pin/v1', (req: Request, res: Response) => {
  const { messageId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(messagePinV1(authUserId, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const { messageId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(messageUnpinV1(authUserId, messageId));
});

// search for messages which contain a query
app.get('/search/v1', (req: Request, res: Response) => {
  const queryStr = req.query.queryStr as string;
  const uId = getUserIdFromRequest(req);

  return res.json(searchV1(uId, queryStr));
});

// Shows stats for users
app.get('/users/stats/v1', (req: Request, res: Response) => {
  getUserIdFromRequest(req);
  res.json(usersStatsV1());
});

// Returns the user's most recent 20 notifications
app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const authUserId = getUserIdFromRequest(req);
  return res.json(notificationsGetV1(authUserId));
});

// Reacts to a message in a channel or DM
app.post('/message/react/v1', (req: Request, res: Response) => {
  const { messageId, reactId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(messageReactV1(authUserId, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const { messageId, reactId } = req.body;
  const authUserId = getUserIdFromRequest(req);

  return res.json(messageUnreactV1(authUserId, messageId, reactId));
});

// handles errors nicely
app.use(errorHandler());

const DEFAULT_WAIT = 300;

/**
 * Check for standup and scheduled message events
 */
const runScheduledEvents = () => {
  const earliestMessage = handleScheduledMessages();
  const earliestStandup = handleScheduledStandups();

  const waitTime = Math.min(
    (earliestMessage || DEFAULT_WAIT), (earliestStandup || DEFAULT_WAIT),
    DEFAULT_WAIT
  );

  timeout = setTimeout(runScheduledEvents, waitTime);
};

let timeout = setTimeout(runScheduledEvents, 0);

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  clearTimeout(timeout);

  server.close(() => console.log('Shutting down server gracefully.'));
});
