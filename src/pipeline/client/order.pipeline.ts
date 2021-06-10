import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { Whatsapp } from 'venom-bot'
import { PipelineResult } from '@/domain/models/pipeline-result'
import { getMessagesFromUserHelper } from '@/infra/persistent-message/get-messages-from-user'
import { processOrder } from '@/infra/process-messages/process-order'
import { renderOrderPizzaItemsMessages } from './templates/orderPizzaItems.message'
import { insertContextInUser } from '@/infra/persistent-context/insert-context-in-user'
import { renderOrderPizzasQuestionsMessage } from './templates/order-pizzas-questions.message'
import { forAwaitEach } from '@/shared/helpers/for-await-each.helper'
import { getContextUser } from '@/infra/persistent-context/get-context-user'
import { complementsQuestionsOrders } from '@/infra/process-messages/complements-questions-orders'
import { Order } from '@/domain/models/order'

export async function orderPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text as string

  const { identifier: userIdentifier } = messageEvent.fromUser

  const context = await getContextUser.get(userIdentifier)

  if (
    context?.name === 'order' &&
    context
      ?.data?.order
      ?.questionsPizzasOrders
      ?.length > 0
  ) {
    const pizzasOrders = context.data.order.pizzas as Order.Pizza[]

    const complementsActualOrders = await complementsQuestionsOrders.loadMessage(dataText)

    const newPizzaOrders = pizzasOrders.map((pizzaOrder, indexOrder) => {
      const complement = complementsActualOrders.find(item => item.indexOrder === indexOrder)
      if (complement) {
        return {
          ...pizzaOrder,
          price: processOrder.getPizzaSize(complement.message) || pizzaOrder.price,
          tastes: [...pizzaOrder.tastes, ...processOrder.getPizzaTastesNumbers(complement.message)]
        } as Order.Pizza
      } else {
        return pizzaOrder
      }
    })

    const orderPizzaMessages = renderOrderPizzaItemsMessages(newPizzaOrders)

    const messages = await forAwaitEach(orderPizzaMessages)(
      async pizzaMessage => await client
        .sendText(userIdentifier, pizzaMessage)
    )

    const questionsPizzasOrders = renderOrderPizzasQuestionsMessage(newPizzaOrders)

    for (const index in questionsPizzasOrders) {
      const questionMessage = questionsPizzasOrders[index]
      if (!questionMessage) continue

      await client.reply(
        userIdentifier,
        questionMessage,
        (messages[index] as any).to._serialized
      )
    }

    if (questionsPizzasOrders.filter(item => !!item).length === 0) {
      client.sendText(userIdentifier, `Você poder confirmar seu${
        newPizzaOrders.length > 1 ? 's' : ''} pedido${
          newPizzaOrders.length > 1 ? 's' : ''} informando sim ou não.`)
    } else {
      client.sendText(userIdentifier, 'Você pode acrescentar algo se preferir.')
    }

    insertContextInUser.add(userIdentifier, 'order', { newPizzaOrders, questionsPizzasOrders })

    return new PipelineResult(true)
  }

  const oldMessagesUser = await getMessagesFromUserHelper.getAllFromUser(userIdentifier)

  const isPossibleOrder =
    /(eu vou|quero|pode ser|vou pedir|preciso|)/i.test(dataText) ||
    /(pizza grande|pizza média|pizza media|piza media|piza grande|pizza big|pizza broto)/i.test(dataText)

  if (isPossibleOrder && oldMessagesUser.length >= 2) {
    const pizzas = await processOrder.loadMessage(dataText)
    const orderPizzaMessages = renderOrderPizzaItemsMessages(pizzas)

    const messages = await forAwaitEach(orderPizzaMessages)(
      async pizzaMessage => await client
        .sendText(userIdentifier, pizzaMessage)
    )

    const questionsPizzasOrders = renderOrderPizzasQuestionsMessage(pizzas)

    for (const index in questionsPizzasOrders) {
      const questionMessage = questionsPizzasOrders[index]
      if (!questionMessage) continue

      await client.reply(
        userIdentifier,
        questionMessage,
        (messages[index] as any).to._serialized
      )
    }

    if (questionsPizzasOrders.filter(item => !!item).length === 0) {
      client.sendText(userIdentifier, `Você poder confirmar seu${
        pizzas.length > 1 ? 's' : ''} pedido${
          pizzas.length > 1 ? 's' : ''} informando sim ou não.`)
    } else {
      client.sendText(userIdentifier, 'Você pode acrescentar algo se preferir.')
    }

    insertContextInUser.add(userIdentifier, 'order', { pizzas, questionsPizzasOrders })

    return new PipelineResult(true)
  } else {
    return new PipelineResult(false)
  }
}
