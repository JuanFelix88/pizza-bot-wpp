import { PipelineResult } from '@/domain/models/pipeline-result'
import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { getMessagesFromUserHelper } from '@/infra/persistent-message/get-messages-from-user'
import { insertMessageInCache } from '@/infra/persistent-message/insert-message-in-cache'
import { log } from '@/shared/helpers/log.helper'
import { Whatsapp } from 'venom-bot'
import { renderWelcomeMessage } from './templates/welcome.message'

export async function welcomePipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text

  if (!dataText) {
    return new PipelineResult(false, {
      error: new TypeError(`Invalid "dataText" with value "${dataText}"`)
    })
  }

  const oldMessagesUser = await getMessagesFromUserHelper.getAllFromUser(messageEvent.fromUser.identifier)

  log`Enviado de {blue id: ${messageEvent.fromUser.identifier}} | {red Push: ${messageEvent.message.sender.pushname}} texto: {cyan ${dataText}}`

  if (oldMessagesUser.length === 0) {
    const welcomeMessage = renderWelcomeMessage()

    await client.sendText(messageEvent.fromUser.identifier, welcomeMessage)
    await client.sendText(messageEvent.fromUser.identifier, 'Veja o que eu posso fazer:\n\n' +
      '👉 *#cardápio* para eu lhe mostrar o cardápio\n' +
      '👉 *#falar* para eu chamar alguém para lhe atender'
    )
    insertMessageInCache.add(messageEvent.fromUser.identifier, dataText)

    return new PipelineResult(true, { userStateChanged: true })
  } else {
    return new PipelineResult(false)
  }
}
