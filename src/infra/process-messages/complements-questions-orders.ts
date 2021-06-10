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

  protected repairMessage (message: string): [number, string, string][] {
    const matches = /(Pizz?a [0-9]{1,3})/ig.exec(message)

    if (!matches) return []

    const splicedMessage = message.split(/(Piz(z)?a [0-9]{1,3})/ig)

    return [...matches]
      .map((literalOrder, index) => [
        (parseInt(literalOrder.replace(/[0-9]{1,3}/, '$1'), 10) - 1),
        literalOrder,
        splicedMessage[index]
      ])
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
