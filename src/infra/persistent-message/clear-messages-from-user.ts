import { messagesCacheMap } from './messages-cache-map'

class ClearMessagesFromUser {
  protected messagesCache = messagesCacheMap

  public async exec (from: string): Promise<void> {
    if (this.messagesCache.has(from)) {
      this.messagesCache.delete(from)
    }
  }
}

namespace ClearMessagesFromUser {}

export const clearMessagesFromUser = new ClearMessagesFromUser()
