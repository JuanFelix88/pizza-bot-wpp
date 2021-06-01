import { MessageCache } from '@/domain/models/message-cache'
import { InvalidContactError } from '@/presentation/errors/invalid-contact'
import { messagesCacheMap } from './messages-cache-map'

class InsertMessageInCache {
  public async add (from: MessageCache.From, dataText: MessageCache.DataText): Promise<void> {
    const cache = messagesCacheMap.get(from) || []

    if (typeof from !== 'string') { throw new InvalidContactError() }

    cache.push({
      dataText,
      from,
      isCommand: false
    })

    messagesCacheMap.set(from, cache)
  }
}

export const insertMessageInCache = new InsertMessageInCache()
