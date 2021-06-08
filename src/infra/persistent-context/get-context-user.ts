import { ContextCache } from '@/domain/models/context-cache'
import { contextsCacheMap } from './context-cache-map'

class GetContextUser {
  protected contextCacheMap = contextsCacheMap

  public async get (from: ContextCache.From): Promise<ContextCache | undefined> {
    return this.contextCacheMap.get(from)
  }
}

export const getContextUser = new GetContextUser()
