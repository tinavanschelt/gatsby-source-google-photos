const globalConst = {}
globalConst.expressPort = '8080'
globalConst.baseAuthUrl = 'https://accounts.google.com'
globalConst.baseUrl = 'https://photoslibrary.googleapis.com/v1'
globalConst.tokenPath = '/o/oauth2/token'
globalConst.authPath = '/o/oauth2/auth'
globalConst.redirectUri = `http://localhost:${globalConst.expressPort}/callback`
globalConst.scopes =
  'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary.sharing https://picasaweb.google.com/data/'

const colorsTheme = {
  debug: 'blue',
  error: 'red',
  info: 'green',
  verbose: 'cyan',
  warn: 'yellow'
}

export default { globalConst, colorsTheme }
