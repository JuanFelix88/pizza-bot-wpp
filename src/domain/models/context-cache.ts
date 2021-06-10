/* eslint-disable no-unused-vars */
export interface ContextCache {
  name: ContextCache.Type
  data: ContextCache.Data
}

export namespace ContextCache {
  export type Type = 'initial' | 'menu' | 'order'
  export type From = string
  export type Data = {
    [key in ContextCache.Type]?: any;
  }
}
