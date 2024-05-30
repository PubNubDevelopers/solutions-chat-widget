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
  COPY = "copy"
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

export enum ToastType {
  INFO = 0,
  CHECK = 1,
  ERROR = 2
}

export enum ChatEventTypes {
  LEAVE = 0,
  JOIN = 1,
  KICK = 2,
}