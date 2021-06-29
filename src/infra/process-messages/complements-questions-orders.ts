import { QuotedMessage } from '@/domain/models/quoted-message'
import { log } from '@/shared/helpers/log.helper'
import { getPizzaReferenceInQuotedMessage } from './get-pizza-reference-in-quoted-message'

type IndexOrder = number
type LiteralIndex = string
type MessageComplement = string

class ComplementsQuestionsOrders {
  private isComplementsMessageRegexp = [
    /(adiciona(r)?|quero (.){0,3} mais|mais um)/i,
    /(tamb(é|e)m (quero)?|po(em|êm|in) (mais)?)/i,
    /(mais tamb(é|e)m|)/i
  ]

  public async loadMessage (
    message: string,
    quotedMessage?: QuotedMessage
  ): Promise<ComplementsQuestionsOrders.ComplementOrder[]> {
    const isComplementsMessage = !!this.isComplementsMessageRegexp.find(rgx => rgx.test(message))

    if (!isComplementsMessage) return []

    const splicedContextsMessages = this.repairMessage(message, quotedMessage)

    return splicedContextsMessages.map(([indexOrder, literalOrder, message]) => ({
      indexOrder,
      literalOrder,
      message
    }))
  }

  protected parseIntPizzaReferenceMessage (message: string): number {
    return parseInt(message.replace(/.*([0-9]).*/, '$1'), 10)
  }

  protected testIsPizzaReference (message: string): boolean {
    return /(Pizz?a [0-9]{1,3})/i.test(message)
  }

  protected testIsQuotedMessagePizzaReference (quotedMessage?: QuotedMessage): boolean {
    return (!!quotedMessage) && /(Pizz?a [0-9]{1,3})/i.test(quotedMessage.body)
  }

  protected getUnaryMapReference (
    index: number,
    literalOrder: string,
    message: string):[IndexOrder, LiteralIndex, MessageComplement][] {
    return [[
      index,
      literalOrder,
      message
    ]]
  }

  protected repairMessage (
    message: string,
    quotedMessage?: QuotedMessage
  ): [IndexOrder, LiteralIndex, MessageComplement][] {
    if (quotedMessage && this.testIsQuotedMessagePizzaReference(quotedMessage)) {
      const reference = getPizzaReferenceInQuotedMessage.getPizzaReference(quotedMessage)

      log`{cyan é quoted message} e literal: {blue ${reference?.literalOrder}} e index: {green ${reference?.index}}`

      if (reference) {
        const {
          index,
          literalOrder
        } = reference
        return this.getUnaryMapReference(index, literalOrder, message)
      } else {
        message = quotedMessage.content + message
      }
    }

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

      const isPizzaReference = this.testIsPizzaReference(item) ||
        this.testIsQuotedMessagePizzaReference(quotedMessage)

      const subsequentItem = splicedMessage[index + 1]

      if (subsequentItem) {
        const literalOrder = isPizzaReference ? item : subsequentItem
        const message = isPizzaReference ? subsequentItem : item
        const parsedInt = this.parseIntPizzaReferenceMessage(literalOrder)

        splicedContextMessage.push([
          parsedInt - 1,
          literalOrder,
          message
        ])

        index++
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
