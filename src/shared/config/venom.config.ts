import { CreateOptions } from 'venom-bot'

export const config: CreateOptions = {
  session: 'test',
  folderNameToken: 'tokens', // folder name when saving tokens
  mkdirFolderToken: '', // folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
  headless: false, // Headless chrome
  useChrome: false, // If false will use Chromium instance
  debug: false, // Opens a debug session
  logQR: false, // Logs QR automatically in terminal
  browserWS: '', // If u want to use browserWSEndpoint
  browserArgs: [''], // Parameters to be added into the chrome browser instance
  puppeteerOptions: {

  }, // Will be passed to puppeteer.launch
  disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
  disableWelcome: true, // Will disable the welcoming message which appears in the beginning
  autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
  updatesLog: false
}
