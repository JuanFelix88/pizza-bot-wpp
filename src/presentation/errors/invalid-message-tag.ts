export class InvalidMessageTag extends Error {
  constructor () {
    super('Invalid Message tag')
    this.name = 'InvalidMessageTag'
  }
}
