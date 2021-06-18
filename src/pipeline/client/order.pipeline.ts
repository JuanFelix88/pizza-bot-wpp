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
import { getPizzaPrice } from '@/infra/process-messages/get-pizza-price'
import { setTimeout } from 'timers/promises'

export namespace PizzaOrderContext {
  export interface Order {
    pizzas?: Order.Pizza[], questionsPizzasOrders?: (string | undefined)[]
  }
}

export interface PizzaOrderContext {
  order: PizzaOrderContext.Order
}

export async function orderPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text as string

  const { identifier: userIdentifier } = messageEvent.fromUser

  const context = await getContextUser.get<PizzaOrderContext>(userIdentifier)

  const isComplementaryMessage = verifyIsMessageComplements.test(dataText)

  if (
    context?.name === 'order' &&
    !isComplementaryMessage &&
    context.data.order?.pizzas &&
    context.data.order.pizzas.length > 0 &&
    /(#)?esqu(é|e)ce?/i.test(dataText)
  ) {
    insertContextInUser.add<PizzaOrderContext.Order>(userIdentifier, 'order', {})

    await client.sendText(userIdentifier, 'Claro, tudo bem!')
    await setTimeout(400)
    await client.sendText(userIdentifier, 'Você pode pedir novamente, vamos ver se dessa vez eu entendo rsrs')

    return new PipelineResult(true)
  }

  if (
    context?.name === 'order' &&
    !isComplementaryMessage &&
    context.data.order?.pizzas &&
    context.data.order.pizzas.length > 0 &&
    /(s(i|í)(m)?|ye(s|p)?|claro|com certeza|concerteza|pode ser|confirmado)/i.test(dataText) &&
    !(context?.data.order.questionsPizzasOrders?.filter(item => !!item)?.length)
  ) {
    return new PipelineResult(false)
  }

  if (
    context?.name === 'order' &&
    !isComplementaryMessage &&
    context.data.order?.pizzas &&
    context.data.order.pizzas.length > 0
  ) {
    await client.sendText(userIdentifier, 'Não entendi sua mensagem, pode repetir com outras referências?')
    return new PipelineResult(true)
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

    const modifiedPizzaOrders = pizzasOrders.map((pizzaOrder, indexOrder) => {
      const complement = complementsActualOrders.find(item => item.indexOrder === indexOrder)

      if (complement) {
        const newTastes = processOrder.getPizzaTastesNumbers(complement.message)
        const { tastes } = pizzaOrder

        newTastes.forEach(item => {
          if (typeof tastes.find(i => item === i) !== 'number') {
            tastes.push(item)
          }
        })

        const size = processOrder.getPizzaSize(complement.message) || pizzaOrder.size

        return {
          ...pizzaOrder,
          size,
          price: getPizzaPrice.getInt(size, tastes),
          tastes
        } as Order.Pizza
      } else {
        return pizzaOrder
      }
    })

    console.log({
      pizzasOrders,
      newPizzaOrders: modifiedPizzaOrders
    })

    const orderPizzaMessages = renderOrderPizzaItemsMessages(modifiedPizzaOrders)

    await client.sendText(
      userIdentifier,
      'Certo, veja como ficou os pedidos:'
    )

    const messages = await forAwaitEach(orderPizzaMessages)(
      async pizzaMessage => await client
        .sendText(userIdentifier, pizzaMessage)
    )

    const questionsPizzasOrders = renderOrderPizzasQuestionsMessage(modifiedPizzaOrders)

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
        modifiedPizzaOrders.length > 1 ? 's' : ''} pedido${
          modifiedPizzaOrders.length > 1 ? 's' : ''} informando sim ou não. Você pode também responder *#esquece* para refazer o pedido.`)
    } else {
      client.sendText(userIdentifier, 'Você pode acrescentar algo se preferir ou então responder *#esquece* para refazer o pedido.')
    }

    await insertContextInUser.add<PizzaOrderContext.Order>(
      userIdentifier,
      'order',
      { pizzas: modifiedPizzaOrders as Order.Pizza[], questionsPizzasOrders }
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
          pizzas.length > 1 ? 's' : ''} informando sim ou não. Você pode também responder *#esquece* para refazer o pedido.`)
    } else {
      client.sendText(userIdentifier, 'Você pode acrescentar algo se preferir ou então responder *#esquece* para refazer o pedido.')
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
