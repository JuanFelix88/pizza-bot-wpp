import { Message, Whatsapp } from 'venom-bot'
import { FinalUserModel } from './final-user'

export interface MessageEvent {
  fromUser: FinalUserModel;
  text?: string;
  type: MessageEvent.TypeMessage;
  client: Whatsapp;
  message: Message;
  isMedia: boolean;
}

export namespace MessageEvent {
  export type TypeMessage =
    | 'text'
    | 'media'
    | 'sticker';
}
