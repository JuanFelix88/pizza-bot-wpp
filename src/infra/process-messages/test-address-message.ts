class TestAddressMessage {
  public test (message: string): boolean {
    const regexp = /R?\.?.*, [0-9]/i
    return regexp.test(message)
  }
}

export const testAddressMessage = new TestAddressMessage()
