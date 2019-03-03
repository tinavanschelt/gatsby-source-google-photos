import { AES as crypto } from 'crypto-js'
import fileExist from 'file-exists'

var path = require('path')
var fs = require('fs')

const tokenFile = path.resolve(__dirname, 'token.json')

const randomKey = () => {
  return crypto.randomBytes(20).toString('hex')
}

const readToken = () => {
  if (fileExist.sync(path.resolve(__dirname, 'token.json'))) {
    //let tokens = fs.readFileSync(tokenFile, 'utf-8')
    //let tokenObj = crypto.decrypt(JSON.parse(tokens.toString()), 'secret123')
    let tokenObj = fs.readFileSync(tokenFile, 'utf-8')
    return JSON.parse(tokenObj)
  } else {
    console.log(`\nError reading token`)
    return null
  }
}

const writeToken = token => {
  fs.writeFileSync(
    path.resolve(__dirname, 'token.json'),
    JSON.stringify(token),
    'utf-8'
  )
}

export default { randomKey, readToken, writeToken }
