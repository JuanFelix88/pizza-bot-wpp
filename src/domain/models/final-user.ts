import { MessageEvent } from '../usecases/message-event'

export interface FinalUserModel {
  name?: string;
  identifier: string;
  lastMessageEvent?: MessageEvent;
}
