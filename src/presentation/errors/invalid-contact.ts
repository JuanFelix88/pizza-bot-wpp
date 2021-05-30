export class InvalidContactError extends Error {
  constructor () {
    super('Invalid contact number error')
    this.name = 'InvalidContactError'
  }
}
