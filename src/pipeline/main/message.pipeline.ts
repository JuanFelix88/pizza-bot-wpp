import { log } from '@/shared/helpers/log.helper'
import { clearMessage } from '@/infra/processors/clear-message'
import { verifyMessageTag } from '@/infra/validators/verify-message-tag'
import { InvalidMessageTag } from '@/presentation/errors/invalid-message-tag'
import { createMessageEvent } from '@/presentation/middlewares/create-message-event'
import { Message, Whatsapp } from 'venom-bot'

export async function messagePipeline (client: Whatsapp, message: Message) {
  try {
    const messageEvent = createMessageEvent.create(client, message)

    if (messageEvent.isMedia) {
      return log`{red Mensagem ignorada de: {blue ${messageEvent.fromUser.identifier}}}`
    }

    if (/^@log/.test(messageEvent.message.body)) console.log(messageEvent.message)

    const dataText = clearMessage.processMessage(messageEvent.message.body)

    if (!verifyMessageTag.testMessage(dataText)) { throw new InvalidMessageTag() }

    messageEvent.text = dataText
  } catch (error) {

  }
}
