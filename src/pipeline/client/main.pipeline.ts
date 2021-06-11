import { MessageEvent } from '@/domain/models/message-event'
import { Pipeline } from '@/domain/models/pipeline'
import { Whatsapp } from 'venom-bot'
import { menuPipeline } from './menu.pipeline'
import { orderPipeline } from './order.pipeline'
import { welcomePipeline } from './welcome.pipeline'

export async function mainPipeline (client: Whatsapp, messageEvent: MessageEvent) {
  const tasksPipelines = [
    welcomePipeline,
    menuPipeline,
    orderPipeline
  ] as const

  // menu
  for (const pipeline of tasksPipelines) {
    const { error, processed }: Pipeline.Result = await pipeline(client, messageEvent)
    if (error) throw new Error(error)
    if (processed) break
  }
}
