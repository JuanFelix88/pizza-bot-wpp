import { ContextCache } from '@/domain/models/context-cache'
import { contextsCacheMap } from './context-cache-map'

export class InsertContextInUser {
  private contextCacheMap = contextsCacheMap

  public async add<T>
  (from: ContextCache.From, name: keyof ContextCache.Data, data: T): Promise<ContextCache<T>> {
    const existentContext = this.contextCacheMap.get(from)

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

    this.contextCacheMap.set(from, context)

    return context as ContextCache<T>
  }
}

export const insertContextInUser = new InsertContextInUser()
