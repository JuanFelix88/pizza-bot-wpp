import { log } from '@/shared/helpers/log.helper'
import { clearMessage } from '@/infra/processors/clear-message'
import { createMessageEvent } from '@/presentation/middlewares/create-message-event'
import { Message, Whatsapp } from 'venom-bot'
import { mainPipeline } from '../client/main.pipeline'
import chalk from 'chalk'
import { clearContextUser } from '@/infra/persistent-context/clear-context-user'
import { clearMessagesFromUser } from '@/infra/persistent-message/clear-messages-from-user'

export async function messagePipeline (client: Whatsapp, message: Message): Promise<void> {
  try {
    const messageEvent = createMessageEvent.create(client, message)

    const { identifier: userIdentifier } = messageEvent.fromUser

    const { isGroupMsg } = messageEvent.message

    if (
      messageEvent.isMedia || (
        userIdentifier !== '554187851739@c.us' &&
        userIdentifier !== '554196610629@c.us' &&
        userIdentifier !== '554198599525@c.us'
      ) || isGroupMsg) {
      return log`{red Mensagem ignorada de: {blue ${messageEvent.fromUser.identifier}}}`
    }

    if (/^@reset/.test(messageEvent.message.body)) {
      await clearContextUser.clearByUser(userIdentifier)
      await clearMessagesFromUser.exec(userIdentifier)
      log`${chalk.bgBlue.black('Context cleared ->')} {green ${userIdentifier}}`
      await client.sendText(userIdentifier, '*Context reset*')
      return
    }

    if (/^@log/.test(messageEvent.message.body)) console.log(messageEvent.message)

    const dataText = clearMessage.processMessage(messageEvent.message.body)

    mainPipeline(client, {
      ...messageEvent,
      text: dataText
    })
  } catch (error) { log`{red ${error}}` }
}
