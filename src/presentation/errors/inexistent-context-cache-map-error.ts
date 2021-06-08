export class InexistentContextCacheMapError extends Error {
  constructor () {
    super('Invalid contact number error')
    this.name = 'InexistentContextCacheMapError'
  }
}
