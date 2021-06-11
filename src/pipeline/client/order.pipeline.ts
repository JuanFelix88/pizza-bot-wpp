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
import { verifyIsMessageComplements } from '@/infra/process-messages/verify-is-message-complements'

namespace PizzaOrderContext {
  export interface Order {
    pizzas?: Order.Pizza[], questionsPizzasOrders?: (string | undefined)[]
  }
}

interface PizzaOrderContext {
  order: PizzaOrderContext.Order
}

export async function orderPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text as string

  const { identifier: userIdentifier } = messageEvent.fromUser

  const context = await getContextUser.get<PizzaOrderContext>(userIdentifier)

  console.log({
    actualContext: context,
    order: context?.data.order
  })

  const isComplementaryMessage = verifyIsMessageComplements.test(dataText)

  console.log([
    context?.name === 'order',
    isComplementaryMessage,
    context?.data.order?.pizzas,
    context?.data.order.pizzas && context?.data.order.pizzas.length > 0
  ])

  if (
    context?.name === 'order' &&
    !isComplementaryMessage &&
    context.data.order?.pizzas &&
    context.data.order.pizzas.length > 0
  ) {
    await client.sendText(userIdentifier, 'Não entendi sua mensagem, pode repetir com outras referências?')
    return new PipelineResult(false)
  }

  if (
    context?.name === 'order' &&
    isComplementaryMessage &&
    context.data.order?.pizzas &&
    context.data.order.pizzas.length > 0
  ) {
    const pizzasOrders = context.data.order.pizzas as Order.Pizza[]

    const complementsActualOrders = await complementsQuestionsOrders.loadMessage(dataText)

    console.log({ complementsActualOrders })

    const newPizzaOrders = pizzasOrders.map((pizzaOrder, indexOrder) => {
      const complement = complementsActualOrders.find(item => item.indexOrder === indexOrder)
      if (complement) {
        const newTastes = processOrder.getPizzaTastesNumbers(complement.message)
        const { tastes } = pizzaOrder

        newTastes.forEach(item => {
          if (typeof tastes.find(i => item === i) !== 'number') {
            tastes.push(item)
          }
        })

        return {
          ...pizzaOrder,
          size: processOrder.getPizzaSize(complement.message) || pizzaOrder.size,
          tastes
        } as Order.Pizza
      } else {
        return pizzaOrder
      }
    })

    console.log({
      pizzasOrders,
      newPizzaOrders
    })

    const orderPizzaMessages = renderOrderPizzaItemsMessages(newPizzaOrders)

    await client.sendText(
      userIdentifier,
      'Certo, veja como ficou os pedidos:'
    )

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

    await insertContextInUser.add<PizzaOrderContext.Order>(
      userIdentifier,
      'order',
      { pizzas: newPizzaOrders as Order.Pizza[], questionsPizzasOrders }
    )

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

    await insertContextInUser.add<PizzaOrderContext.Order>(
      userIdentifier,
      'order',
      { pizzas, questionsPizzasOrders }
    )

    return new PipelineResult(true)
  } else {
    return new PipelineResult(false)
  }
}
