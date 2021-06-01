import { log } from '@/shared/helpers/log.helper'
import { clearMessage } from '@/infra/processors/clear-message'
import { createMessageEvent } from '@/presentation/middlewares/create-message-event'
import { Message, Whatsapp } from 'venom-bot'
import { mainPipeline } from '../client/main.pipeline'

export async function messagePipeline (client: Whatsapp, message: Message) {
  try {
    const messageEvent = createMessageEvent.create(client, message)

    const { identifier: userIdentifier } = messageEvent.fromUser

    if (
      messageEvent.isMedia || (
        userIdentifier !== '554187851739@c.us' &&
        userIdentifier !== '554196610629@c.us'
      )) {
      return log`{red Mensagem ignorada de: {blue ${messageEvent.fromUser.identifier}}}`
    }

    if (/^@log/.test(messageEvent.message.body)) console.log(messageEvent.message)

    const dataText = clearMessage.processMessage(messageEvent.message.body)

    mainPipeline(client, {
      ...messageEvent,
      text: dataText
    })
  } catch (error) { log`{red ${error}}` }
}
