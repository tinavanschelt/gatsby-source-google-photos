import chalk from 'chalk'

const globalConst = {}
globalConst.expressPort = '8080'
globalConst.baseAuthUrl = 'https://accounts.google.com'
globalConst.baseUrl = 'https://photoslibrary.googleapis.com/v1'
globalConst.tokenPath = '/o/oauth2/token'
globalConst.authPath = '/o/oauth2/auth'
globalConst.redirectUri = `http://localhost:${globalConst.expressPort}/callback`
globalConst.scopes =
  'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary.sharing https://picasaweb.google.com/data/'

// Chalk presets for terminal highlighting
const error = chalk.bold.red
const info = chalk.green
const warn = chalk.bold.yellow

export default { globalConst, error, info, warn }
