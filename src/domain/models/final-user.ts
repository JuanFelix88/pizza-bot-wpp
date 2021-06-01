import { MessageEvent } from './message-event'

export interface FinalUserModel {
  name?: string;
  identifier: string;
  lastMessageEvent?: MessageEvent;
}
