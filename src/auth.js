import oauth2 from 'simple-oauth2'
import axios from 'axios'
import express from 'express'

import { globalConst, error, warn, info } from './config.js'
import { writeToken } from './utils/token.js'

var os = require('os')
const opn = require('opn')

const initOauth = config => {
  const credentials = {
    client: {
      id: config.clientId,
      secret: config.clientSecret
    },
    auth: {
      tokenHost: globalConst.baseAuthUrl,
      tokenPath: globalConst.tokenPath,
      authorizePath: globalConst.authPath
    }
  }

  return oauth2.create(credentials)
}

const refreshToken = async (config, token) => {
  try {
    let oauth = initOauth(config)
    let accessToken = oauth.accessToken.create(token)
    console.log(error(`\nRefreshing Token:\n`), accessToken)
    token = await accessToken.refresh()
    let checkingToken = await checkToken(token)
    console.log(info('checkingToken is ', checkToken))
    if (checkingToken.status === 400) {
      return checkingToken
    }
    if (checkingToken.token === token) {
      writeToken(token)
      return token
    } else {
      throw 'Internal error'
    }
  } catch (err) {
    console.log(error(`\nError while refreshing token: ${err}`))
    return { status: 400 }
  }
}

const checkToken = async checkingToken => {
  const token = checkingToken.token || checkingToken
  console.log(info(`\nToken in checkToken\n`), token)
  let accessToken = token['access_token']
  try {
    console.log(info(`\nCalling axios with token:\n`), accessToken)
    const response = await axios.post(
      `https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=${accessToken}`
    )
    if (response.status === 200) {
      console.log(info('\nAxios request succesful, returned 200'))
      return { status: 200, token: checkingToken }
    } else {
      throw `\nUncaught Error ${response.status},
              ${response.error}, ${response.error_description}`
    }
  } catch (err) {
    console.log(error(`\nError while checking token: ${err}`))
    return { status: 400 }
  }
}

export const checkAuth = async (config, token) => {
  if (token) {
    let result = await checkToken(token)
    if (result.status === 400) {
      console.log(warn(`\nAccess Token invalid, refreshing token\n`), token)
      token = await refreshToken(config, token)
      if (token.status === 400) {
        console.log(
          warn('\nRefresh Token is expired, refreshing authentication')
        )
        const result = await authGooglePhotos(config)
        return result //.token['access_token']
      }
    } else if (result.status === 200) return result.token['access_token']
  } else {
    console.log(warn('\nToken is not present. Fetching a new one...'))
    const result = await authGooglePhotos(config)
    return result //.token['access_token']
  }
}

export const authGooglePhotos = config => {
  const oauth = initOauth(config)
  const authUri = oauth.authorizationCode.authorizeURL({
    redirect_uri: globalConst.redirectUri,
    scope: globalConst.scopes
  })
  const app = express()
  var server = app.listen(globalConst.expressPort, () => {
    opn(`http://${os.hostname}:${globalConst.expressPort}/auth`)
  })
  return new Promise(resolve => {
    app.get('/auth', (req, res) => {
      console.log(info(`\nAuth hit`))
      res.redirect(authUri)
    })
    app.get('/callback', (req, res) => {
      if (req.query.state == config.state) {
        console.log(info(`\nCallback hit`, req.query))
        const code = req.query.code
        res.send('Authentication code received!')
        resolve({
          redirect_uri: globalConst.redirectUri,
          code
        })
      } else {
        res.send(
          `ATTENTION!\nSeems like the state is manipulated on the way back. This probably means XSRF!`
        )
      }
    })
  })
    .then(res => oauth.authorizationCode.getToken(res))
    .then(res => {
      const accessToken = oauth.accessToken.create(res)
      console.log(info(`\nCallback result is\n`, accessToken))
      return Promise.all([checkToken(accessToken), res])
    })
    .then(res => {
      server.close(() => {
        console.log(info('\nFetching token done, closing down server'))
      })
      const result = res[0]['token']['token']
      const token = result['access_token']
      console.log(info('resolve is', res[1]['access_token'], token))
      if (token === res[1]['access_token']) {
        writeToken(result)
        return token
      } else {
        throw 'Internal error'
      }
    })
    .catch(err => {
      console.log(error('\nError while fetching token,'), err)
    })
}
