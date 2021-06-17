import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { PipelineResult } from '@/domain/models/pipeline-result'
import { getContextUser } from '@/infra/persistent-context/get-context-user'
import { insertContextInUser } from '@/infra/persistent-context/insert-context-in-user'
import { Whatsapp } from 'venom-bot'
import { PizzaOrderContext } from './order.pipeline'
import { setTimeout } from 'timers/promises'

export interface ConfirmOrderContext {
  'confirm-order': ConfirmOrderContext.ConfirmOrder;
  'order': PizzaOrderContext.Order
}

export namespace ConfirmOrderContext {
  export interface ConfirmOrder {
    confirm: boolean
  }
}

export async function confirmOrderPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text as string

  const { fromUser: { identifier: userIdentifier } } = messageEvent

  const userContext = await getContextUser.get<ConfirmOrderContext>(userIdentifier)

  const orderContext = userContext?.data?.order as (PizzaOrderContext.Order | undefined)

  if (!orderContext) {
    return new PipelineResult(false)
  }

  const {
    pizzas
  } = orderContext

  if (pizzas?.length && pizzas.length === 0) {
    return new PipelineResult(false, {
      error: new Error('NotProcessedTheMessageCorrectly')
    })
  }

  if (!(/(s(i|í)(m)?|ye(s|p)?|claro|com certeza|concerteza|pode ser|confirmado|)/i.test(dataText) &&
  !/n(ã|a)o/i.test(dataText))) {
    return new PipelineResult(true)
  }

  await insertContextInUser.add<ConfirmOrderContext.ConfirmOrder>(userIdentifier, 'confirm-order', {
    confirm: true
  })

  await client.sendText(userIdentifier, 'Seu pedido foi confirmado.')
  await setTimeout(1200)
  await client.sendText(userIdentifier, 'Estamos processando seu pedido..')
  await setTimeout(2000)
  await client.sendText(userIdentifier, 'Seu pedido já foi encaminhado para produção, ficará pronto entre 20 à 35 minutinhos 😋')
  await client.sendText(userIdentifier, 'Nós da Pizzaria Lollapalooza agradecemos a preferência! 🤝')

  return new PipelineResult(true)
}
