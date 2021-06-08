import { ContextCache } from '@/domain/models/context-cache'
import { InexistentContextCacheMapError } from '@/presentation/errors/inexistent-context-cache-map-error'
import { contextsCacheMap } from './context-cache-map'

namespace ClearContextUser {
  export interface Options {
    /**
     * @default false
     */
    exceptInexistent?: boolean;
    /**
     * @default false
     */
    triggerOnceWhile?: boolean;
  }
}

class ClearContextUser {
  protected contextCacheMap = contextsCacheMap

  public async clearByUser (from: ContextCache.From, options: ClearContextUser.Options = {}): Promise<void> {
    const {
      exceptInexistent

    } = options

    const existObjectMap = this.contextCacheMap.has(from)

    if (exceptInexistent && !existObjectMap) { throw new InexistentContextCacheMapError() }

    this.contextCacheMap.delete(from)
  }
}

export const clearContextUser = new ClearContextUser()
