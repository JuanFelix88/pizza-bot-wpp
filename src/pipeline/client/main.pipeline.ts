import { MessageEvent } from '@/domain/usecases/message-event'
import { Whatsapp } from 'venom-bot'
import { getMessagesFromUserHelper } from '@/infra/persistent-message/get-messages-from-user'

export async function mainPipeline (client: Whatsapp, messageEvent: MessageEvent) {
  const textData = messageEvent.text

  const userMessages = await getMessagesFromUserHelper.getAllFromUser(messageEvent.fromUser.identifier)
}
