import { BadMessageFormat } from '@/presentation/errors/bad-message-format'

class ClearMessage {
  public processMessage (data: string): string {
    const dataFormatted = data.trim()

    if (dataFormatted.length <= 1) { throw new BadMessageFormat() }

    return dataFormatted
  }
}

export const clearMessage = new ClearMessage()
