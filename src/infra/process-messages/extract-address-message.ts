class ExtractAddressMessage {
  protected regexp = /(R?\.?.*, [0-9])/i

  public load (message: string): string | undefined {
    const result = this.regexp.exec(message)
    return result ? result[0] : undefined
  }
}

namespace ExtractAddressMessage {}

export const extractAddressMessage = new ExtractAddressMessage()
