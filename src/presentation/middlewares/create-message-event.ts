import { MessageEvent } from '@/domain/models/message-event'
import { Message, Whatsapp } from 'venom-bot'

class CreateMessageEvent {
  public create (client: Whatsapp, message: Message): MessageEvent {
    return {
      fromUser: {
        identifier: message.from
      },
      isMedia: message.isMedia,
      type: 'text',
      text: message.body,
      client,
      message
    }
  }
}

export const createMessageEvent = new CreateMessageEvent()
