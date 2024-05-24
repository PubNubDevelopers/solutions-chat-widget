export enum ChatNameModals {
    UNDEFINED = "undefined",
    USER = "user",
    CHANNEL = "channel"
  }

export enum MessageActionsTypes {
  REPLY_IN_THREAD = "reply",
  QUOTE = "quote",
  PIN = "pin",
  REACT = "react"
}

export enum ChatHeaderActionIcon {
  MARK_READ = 0,
  ADD = 1
}

export interface CustomQuotedMessage {
  sender: string;
  message: string;
}