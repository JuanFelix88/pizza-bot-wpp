class ComplementsQuestionsOrders {
  private isComplementsMessageRegexp = [
    /(adiciona(r)?|quero (.){0,3} mais|mais um)/i,
    /(tamb(é|e)m (quero)?|po(em|êm|in) (mais)?)/i,
    /(mais tamb(é|e)m|)/i
  ]

  public async loadMessage (
    message: string
  ): Promise<ComplementsQuestionsOrders.ComplementOrder[]> {
    const isComplementsMessage = !!this.isComplementsMessageRegexp.find(rgx => rgx.test(message))

    if (!isComplementsMessage) return []

    const splicedContextsMessages = this.repairMessage(message)

    return splicedContextsMessages.map(([indexOrder, literalOrder, message]) => ({
      indexOrder,
      literalOrder,
      message
    }))
  }

  protected parseIntPizzaReferenceMessage (message: string): number {
    return parseInt(message.replace(/.*([0-9]).*/, '$1'), 10)
  }

  protected repairMessage (message: string): [number, string, string][] {
    if (
      !/(Pizz?a [0-9]{1,3})/ig.test(message)
    ) return []

    const splicedMessage = message
      .split(/(Pizz?a [0-9]{1,3})/ig)
      .filter(item => !!item)

    const splicedContextMessage: [number, string, string][] = []

    for (
      let index = 0;
      index <= splicedMessage.length;
      index++
    ) {
      const item = splicedMessage[index]

      const isPizzaReference = index % 2 === 0 && /(Pizz?a [0-9]{1,3})/i.test(item)

      const subsequentItem = splicedMessage[index + 1]

      if (isPizzaReference && subsequentItem) {
        const parsedInt = this.parseIntPizzaReferenceMessage(item)

        splicedContextMessage.push([
          parsedInt - 1,
          item,
          subsequentItem
        ])
      }
    }

    return splicedContextMessage
      .sort(([a], [b]) => a > b ? 1 : -1)
  }
}

export namespace ComplementsQuestionsOrders {
  export type QuestionsMessagesContext = string | undefined

  export type ComplementOrder = {
    message: string
    indexOrder: number
    literalOrder: string
  }
}

export const complementsQuestionsOrders = new ComplementsQuestionsOrders()
