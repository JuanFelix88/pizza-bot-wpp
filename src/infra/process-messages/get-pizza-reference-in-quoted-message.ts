class GetPizzaReferenceInQuotedMessage {
  protected isPizzaReference (content: string): boolean {
    return /(Pizz?a [0-9]{1,3})/i.test(content)
  }

  protected getIndexOrder (literalOrder: string): number {
    return parseInt(literalOrder.replace(/.*([0-9]).*/, '$1'), 10) - 1
  }

  protected getLiteral (content: string): string {
    const compiled = /(Pizz?a [0-9]{1,3})/i.exec(content)

    if (!compiled) { throw new TypeError('Error in process content literal order because object \'compiled\' is "null"') }

    const [onlyLiteral] = /(Pizz?a [0-9]{1,3})/i.exec(content) as string[]

    if (typeof onlyLiteral !== 'string') { throw new TypeError('Error to get literal text from ordering order') }

    return onlyLiteral
  }

  public getPizzaReference (
    quotedMessage: GetPizzaReferenceInQuotedMessage.QuotedContent
  ): GetPizzaReferenceInQuotedMessage.Result | undefined {
    const { content } = quotedMessage

    if (!content || !this.isPizzaReference(content)) return undefined

    const literalOrder = this.getLiteral(content)
    const indexOrder = this.getIndexOrder(literalOrder)

    return {
      index: indexOrder,
      literalOrder
    }
  }
}

namespace GetPizzaReferenceInQuotedMessage {
  export interface Result {
    literalOrder: string;
    index: number;
  }

  export interface QuotedContent {
    content: string;
  }
}

export const getPizzaReferenceInQuotedMessage = new GetPizzaReferenceInQuotedMessage()
