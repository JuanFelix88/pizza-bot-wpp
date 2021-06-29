import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { PipelineResult } from '@/domain/models/pipeline-result'
import { getContextUser } from '@/infra/persistent-context/get-context-user'
import { insertContextInUser } from '@/infra/persistent-context/insert-context-in-user'
import { getLatLongByMessageEvent } from '@/infra/process-location/get-lat-long-by-message-event'
import { extractAddressMessage } from '@/infra/process-messages/extract-address-message'
import { testAddressMessage } from '@/infra/process-messages/test-address-message'
import { Whatsapp } from 'venom-bot'
import { renderAddressMessage } from './templates/address.message'

interface AddressContext {
  address?: AddressContext.Address
}

namespace AddressContext {
  export interface Address {
    lat?: number;
    long?: number;
    needsComplement?: 'yes' | 'no';
    complement?: string;
    complete?: string;
  }
}

export async function addressPipeline (client: Whatsapp, messageEvent: MessageEvent): Promise<Pipeline.Result> {
  const dataText = messageEvent.text
  const userIdentifier = messageEvent.fromUser.identifier
  const { type: typeMessage } = messageEvent

  if (!dataText) {
    return new PipelineResult(false, {
      error: new Error('Message text not bet undefined')
    })
  }

  const actualContext = await getContextUser.get<AddressContext>(userIdentifier)

  // open context
  if (actualContext?.name === 'initial') {
    await client.sendText(userIdentifier, renderAddressMessage())
    await insertContextInUser.add(userIdentifier, 'address', {})
    return PipelineResult.stopPropagation(true)
  }

  const isAddressMessage = testAddressMessage.test(dataText)
  const hasLatLong = typeof actualContext?.data.address?.lat === 'number' && typeof actualContext?.data.address?.long === 'number'
  const hasCompleteAddress = !!actualContext?.data?.address?.complete
  const hasCompleteAddressOrLatLong = hasLatLong || hasCompleteAddress
  const notNeedsComplement = actualContext?.data.address?.needsComplement === 'no'
  const hasComplement = notNeedsComplement || !!actualContext?.data.address?.complement
  const isTypeLocation = typeMessage === 'location'

  if (isTypeLocation) {
    const [lat, long] = getLatLongByMessageEvent.extract(messageEvent.message as any)
    await insertContextInUser.add<AddressContext.Address>(userIdentifier, 'address', {
      lat,
      long
    })

    if (!hasComplement) {
      await client.sendText(userIdentifier, 'Gostaria de complementar algo?')
      return PipelineResult.stopPropagation(true)
    }

    // when has complement
    await client.sendText(userIdentifier, 'Show, endereço notado.')
    await client.sendText(messageEvent.fromUser.identifier, 'Veja o que eu posso fazer:\n\n' +
      '👉 *#cardápio* para eu lhe mostrar o cardápio\n' +
      '👉 *#falar* para eu chamar alguém para lhe atender'
    )
    return PipelineResult.stopPropagation(true)
  }

  // bypass context
  if (hasCompleteAddressOrLatLong && hasComplement) {
    return PipelineResult.bypass(false)
  }

  // process complement
  if (
    !hasComplement &&
    !notNeedsComplement &&
    !isAddressMessage &&
    actualContext?.name === 'address' &&
    hasCompleteAddressOrLatLong
  ) {
    const testIsNegativeAdeptComplement = /(n(ã|a)o|tudo certo|ta ok|confirmado)/i.test(dataText)

    if (testIsNegativeAdeptComplement) {
      await insertContextInUser.implementsData<AddressContext.Address>(userIdentifier, 'address', {
        needsComplement: 'no'
      })
    } else {
      await insertContextInUser.implementsData<AddressContext.Address>(userIdentifier, 'address', {
        complement: dataText,
        needsComplement: 'yes'
      })
    }

    await client.sendText(userIdentifier, 'Show, endereço notado.')
    await client.sendText(messageEvent.fromUser.identifier, 'Veja o que eu posso fazer:\n\n' +
    '👉 *#cardápio* para eu lhe mostrar o cardápio\n' +
    '👉 *#falar* para eu chamar alguém para lhe atender'
    )
    return PipelineResult.stopPropagation(true)
  }

  // close context
  if (actualContext?.name === 'address' && isAddressMessage) {
    await client.sendText(userIdentifier, 'Obrigado por informar.')
    await insertContextInUser.add<AddressContext.Address>(userIdentifier, 'address', {
      complete: extractAddressMessage.load(dataText)
    })

    if (!hasComplement) {
      await client.sendText(userIdentifier, 'Gostaria de complementar algo?')
      return PipelineResult.stopPropagation(true)
    }

    await client.sendText(messageEvent.fromUser.identifier, 'Veja o que eu posso fazer:\n\n' +
    '👉 *#cardápio* para eu lhe mostrar o cardápio\n' +
    '👉 *#falar* para eu chamar alguém para lhe atender'
    )
    return PipelineResult.stopPropagation(true)
  }

  // failure context
  if (actualContext?.name === 'address' && !isAddressMessage) {
    await client.sendText(userIdentifier, 'Não possível entender o seu endereço, você pode repetir com *Rua*, *número*?')
    return PipelineResult.stopPropagation()
  }

  return PipelineResult.bypass()
}
