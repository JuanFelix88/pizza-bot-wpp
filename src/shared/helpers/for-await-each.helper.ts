import { isPromise } from 'util/types'

type Callback<T, U> = (item: T, index: number) => Promise<U>

export function forAwaitEach<T> (arr: T[]) {
  return async <U>(cb: Callback<T, U>): Promise<U[]> => {
    const list: U[] = []
    for (const index in arr) {
      const item = arr[index]
      const result = cb(item, index as any)

      if (isPromise(result)) {
        list.push(await result)
      } else {
        list.push(result)
      }
    }
    return await Promise.all(list)
  }
}
