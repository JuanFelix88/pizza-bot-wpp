/* eslint-disable no-unused-vars */
export interface ContextCache<T = ContextCache.Data> {
  name: ContextCache.Type
  data: T
}

export namespace ContextCache {
  export type Type = 'initial' | 'address' | 'menu' | 'order' | 'confirm-order'
  export type From = string
  export type Data = {
    [key in ContextCache.Type]?: any;
  }
}
