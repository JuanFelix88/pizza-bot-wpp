import { ContextCache } from '@/domain/models/context-cache'
import { contextsCacheMap } from './context-cache-map'

export class InsertContextInUser {
  protected contextCacheMap = contextsCacheMap

  public async add<T extends keyof ContextCache.Data>
  (user: ContextCache.From, name: T, data: ContextCache.Data[T]): Promise<ContextCache> {
    const existentContext = this.contextCacheMap.get(user)

    const context: ContextCache =
      existentContext
        ? {
            name,
            data: {
              ...existentContext.data,
              [name]: data
            }
          }
        : {
            name,
            data: {
              [name]: data
            }
          }

    this.contextCacheMap.set(user, context)

    return context
  }
}

export const insertContextInUser = new InsertContextInUser()
