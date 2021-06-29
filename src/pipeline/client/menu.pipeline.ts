import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { PipelineResult } from '@/domain/models/pipeline-result'
import { insertMessageInCache } from '@/infra/persistent-message/insert-message-in-cache'
import { Whatsapp } from 'venom-bot'
import { renderMenuMessage } from './templates/menu.message'
import { renderMenuQuestionMessage } from './templates/question-menu.message'
import { setTimeout } from 'timers/promises'
import { insertContextInUser } from '@/infra/persistent-context/insert-context-in-user'
import { getContextUser } from '@/infra/persistent-context/get-context-user'

interface Context {
  'address'?: Context.Address
}

namespace Context {
  export type Address = {
    lat?: number;
    long?: number;
    complete?: string;
    complement?: string;
    needsComplement: 'yes' | 'no'
  }
}

export async function menuPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const { identifier: userIdentifier } = messageEvent.fromUser
  const dataText = messageEvent.text

  if (!dataText) {
    return new PipelineResult(false, {
      error: TypeError('You can not process a message that does not exist!')
    })
  }

  const textMatchHashTag = /((#)?(cardápio|cardapio|cardapo|cardpio|cerdpio|cerdapo))/i.test(dataText)

  const actualContext = await getContextUser.get<Context>(userIdentifier)

  const notNeedsComplement = actualContext?.data.address?.needsComplement === 'no'
  const hasLatLong = typeof actualContext?.data.address?.lat === 'number' && typeof actualContext?.data.address?.long === 'number'
  const hasCompleteAddressOrLatLong = hasLatLong || !!actualContext?.data.address?.complete
  const hasComplement = notNeedsComplement || !!actualContext?.data.address?.complement
  const hasAddress = hasCompleteAddressOrLatLong && hasComplement

  if (textMatchHashTag && dataText.length <= 15 && hasAddress) {
    const menuMessage = renderMenuMessage()
    const menuQuestionMessage = renderMenuQuestionMessage()

    client.sendText(userIdentifier, menuMessage)

    await setTimeout(1900)

    client.sendText(userIdentifier, menuQuestionMessage)

    insertContextInUser.add(userIdentifier, 'menu', {})

    insertMessageInCache.add(userIdentifier, dataText)

    return PipelineResult.stopPropagation(true)
  } else {
    return new PipelineResult(false)
  }
}
