import Venom from 'venom-bot'
import { messagePipeline } from './pipeline/main/message.pipeline'
import { setDarkThemePipeline } from './pipeline/main/theme.pipeline'
import { config } from './shared/config/venom.config'

const venom: typeof Venom = (require('venom-bot') as any)

venom.create(config)
  .then(client => setDarkThemePipeline(client))
  .then(client => client.onMessage(message => messagePipeline(client, message)))
