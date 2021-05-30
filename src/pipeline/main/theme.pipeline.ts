import { Whatsapp } from 'venom-bot'

type Themes = 'dark' | 'light'

export async function setDarkThemePipeline (client: Whatsapp, theme: Themes = 'dark'): Promise<Whatsapp> {
  client.setTheme(theme)
  return client
}
