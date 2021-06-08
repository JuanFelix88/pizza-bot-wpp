import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { Whatsapp } from 'venom-bot'
import { PipelineResult } from '@/domain/models/pipeline-result'
import { getMessagesFromUserHelper } from '@/infra/persistent-message/get-messages-from-user'
import { processOrder } from '@/infra/process-messages/process-order'
import { renderOrderPizzaItemsMessages } from './templates/orderPizzaItems.message'
import { insertContextInUser } from '@/infra/persistent-context/insert-context-in-user'

export async function orderPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text as string

  const { identifier: userIdentifier } = messageEvent.fromUser

  const oldMessagesUser = await getMessagesFromUserHelper.getAllFromUser(messageEvent.fromUser.identifier)

  const isPossibleOrder =
    /(eu vou|quero|pode ser|vou pedir|preciso|)/i.test(dataText) ||
    /(pizza grande|pizza média|pizza media|piza media|piza grande|pizza big|pizza broto)/i.test(dataText)

  const isBotMessage = !![
    /Você poder confirmar seu\(s\)/i,
    /🍕 Sabor\(es\):|Seu pedido então/i,
    /Seu pedido então/i,
    /Informe o tamanho da pizza e o\(s\)/i
  ].find(regex => regex.test(dataText))

  if (isPossibleOrder && !isBotMessage && oldMessagesUser.length >= 2) {
    const pizzas = await processOrder.loadMessage(dataText)

    const orderPizzaMessages = renderOrderPizzaItemsMessages(pizzas)

    for (const pizzaMessage of orderPizzaMessages) { await client.sendText(userIdentifier, pizzaMessage) }

    insertContextInUser.add(userIdentifier, 'order', { pizzas })

    client.sendText(userIdentifier, 'Você poder confirmar seu(s) pedido(s) informando sim ou não.')

    return new PipelineResult(true)
  } else {
    return new PipelineResult(false)
  }
}
