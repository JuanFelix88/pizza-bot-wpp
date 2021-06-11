import { ContextCache } from '@/domain/models/context-cache'
import { contextsCacheMap } from './context-cache-map'

class GetContextUser {
  protected contextCacheMap = contextsCacheMap

  public async get<T = any> (from: ContextCache.From): Promise<ContextCache<T> | undefined> {
    const result = this.contextCacheMap.get(from)

    return result as ContextCache<T>
  }
}

export const getContextUser = new GetContextUser()
