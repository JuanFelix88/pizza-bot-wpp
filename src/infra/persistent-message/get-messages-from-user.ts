import { MessageCache } from '@/domain/models/message-cache'
import { messagesCacheMap } from './messages-cache-map'

export class GetMessagesFromUserHelper {
  public async getAllFromUser (from: MessageCache.From): Promise<MessageCache[]> {
    return messagesCacheMap.get(from) || []
  }
}

export const getMessagesFromUserHelper = new GetMessagesFromUserHelper()
