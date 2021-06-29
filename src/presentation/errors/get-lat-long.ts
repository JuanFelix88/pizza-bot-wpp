export class GetLatLongError extends Error {
  constructor () {
    super('Invalid \'lat\' \'long\' error type')
    this.name = 'GetLatLongError'
  }
}
