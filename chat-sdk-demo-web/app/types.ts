import { Channel } from '@pubnub/chat'

export enum ChatNameModals {
    UNDEFINED ="undefined",
    USER = "user",
    CHANNEL = "channel"
  }

export enum MessageActionsTypes {
  REPLY_IN_THREAD = "reply",
  QUOTE = "quote",
  PIN = "pin",
  REACT = "react",
  COPY = "copy",
  SHOW_EMOJI = "show_emoji"
}

export enum ChatHeaderActionIcon {
  MARK_READ = 0,
  ADD = 1,
  NONE = 2
}

export interface CustomQuotedMessage {
  sender: string;
  message: string;
}

export interface UnreadMessagesOnChannel {
  channel: Channel,
  count: number
}

export enum ToastType {
  INFO = 0,
  CHECK = 1,
  ERROR = 2
}

export enum ChatEventTypes {
  LEAVE = 0,  //  Notify other members of a group that you are leaving that group
  INVITED = 1,//  Notify the recipient(s) that they are now part of a new group chat or DM.
  //KICK = 2,   //  Notify a specific individual that they should leave the chat
  JOINED = 3  //  Notify others in a group that you have joined as a new member (for public channels)
}