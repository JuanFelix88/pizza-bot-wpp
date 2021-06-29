import { PipelineResult } from '@/domain/models/pipeline-result'
import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { getMessagesFromUserHelper } from '@/infra/persistent-message/get-messages-from-user'
import { insertMessageInCache } from '@/infra/persistent-message/insert-message-in-cache'
import { log } from '@/shared/helpers/log.helper'
import { Whatsapp } from 'venom-bot'
import { renderWelcomeMessage } from './templates/welcome.message'
import { insertContextInUser } from '@/infra/persistent-context/insert-context-in-user'
import { getContextUser } from '@/infra/persistent-context/get-context-user'

export async function welcomePipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text
  const userIdentifier = messageEvent.fromUser.identifier

  if (!dataText) {
    return new PipelineResult(false, {
      error: new TypeError(`Invalid "dataText" with value "${dataText}"`)
    })
  }

  const oldMessagesUser = await getMessagesFromUserHelper.getAllFromUser(messageEvent.fromUser.identifier)
  const userContext = await getContextUser.get(userIdentifier)

  log`Enviado de {blue id: ${messageEvent.fromUser.identifier}} | {red Push: ${messageEvent.message.sender.pushname}} texto: {cyan ${dataText}}`

  if (oldMessagesUser.length === 0 && userContext?.name !== 'initial') {
    const welcomeMessage = renderWelcomeMessage()

    await client.sendText(messageEvent.fromUser.identifier, welcomeMessage)

    insertContextInUser.add(userIdentifier, 'initial', {})
    insertMessageInCache.add(userIdentifier, dataText)

    return new PipelineResult(false, { userStateChanged: true })
  } else {
    return new PipelineResult(false)
  }
}
