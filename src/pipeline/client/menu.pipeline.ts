import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { PipelineResult } from '@/domain/models/pipeline-result'
import { insertMessageInCache } from '@/infra/persistent-message/insert-message-in-cache'
import { Whatsapp } from 'venom-bot'
import { renderMenuMessage } from './templates/menu.message'
import { renderMenuQuestionMessage } from './templates/question-menu.message'
import { setTimeout } from 'timers/promises'

export async function menuPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const { identifier: userIdentifier } = messageEvent.fromUser
  const dataText = messageEvent.text

  if (!dataText) {
    return new PipelineResult(false, {
      error: TypeError('You can not process a message that does not exist!')
    })
  }

  const textMatchHashTag = /(#cardápio|#cardapio|#cardapo|#cardpio|#cerdpio|#cerdapo)/.test(dataText)

  if (textMatchHashTag && dataText.length <= 15) {
    const menuMessage = renderMenuMessage()
    const menuQuestionMessage = renderMenuQuestionMessage()

    client.sendText(userIdentifier, menuMessage)

    await setTimeout(1900)

    client.sendText(userIdentifier, menuQuestionMessage)

    insertMessageInCache.add(userIdentifier, dataText)

    return new PipelineResult(true, {
      userStateChanged: true
    })
  } else {
    return new PipelineResult(false)
  }
}
