export class BadMessageFormat extends Error {
  constructor () {
    super('The message format is not valid for use')
    this.name = 'BadMessageFormat'
  }
}
