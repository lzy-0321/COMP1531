export interface React {
  reactId: number,
  uIds: number[]
}

export interface ReactOutput extends React {
  isThisUserReacted: boolean
}

export interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  deleted: boolean,
  isPinned: boolean,
  reacts: React[]
}

export interface UserStat {
  channelsJoined: {numChannelsJoined: number, timeStamp: number}[],
  dmsJoined: {numDmsJoined: number, timeStamp: number}[],
  messagesSent: {numMessagesSent: number, timeStamp: number}[],
  involvementRate: number
}

export interface UsersStats {
  channelsExist: [{ numChannelsExist: number, timeStamp: number }],
  dmsExist: [{ numDmsExist: number, timeStamp: number }],
  messagesExist: [{ numMessagesExist: number, timeStamp: number }],
  utilizationRate: number
}

export interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string
}

export interface UserDetails {
  uID: number,
  email: string,
  passwordHash: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  isGlobalOwner: 1 | 2,
  isActivated: boolean,
  userStats: UserStat,
  notifications: Notification[]
}

export interface Standup {
  finishTime: number,
  initiator: number,
  messages: { senderHandle: string, contents: string }[]
}

export interface ChannelDetails {
  channelId: number,
  isPublic: boolean,
  name: string,
  messageIds: number[],
  ownerMembers: number[],
  allMembers: number[],
  activeStandup: Standup | null
}

export interface DMDetails {
  dmId: number,
  owner: number,
  allMembers: number[],
  name: string,
  messageIds: number[],
  deleted: boolean
}

export type Venue = ChannelDetails | DMDetails;
export type VenueName = 'channels' | 'dms';

export interface DataStore {
  users: UserDetails[],
  channels: ChannelDetails[],
  issuedTokens: { [hasedToken: string]: number },
  dms: DMDetails[],
  allMessages: Message[],
  passwordResetCodes: { [resetCode: string]: number },
  scheduledMessages: {
    timeSent: number,
    messageId: number,
    message: Message,
    venueType: VenueName,
    venueId: number
  }[],
  usersStats: UsersStats,
}
