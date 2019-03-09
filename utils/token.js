'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cryptoJs = require('crypto-js');

var _fileExists = require('file-exists');

var _fileExists2 = _interopRequireDefault(_fileExists);

var _config = require('../config.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var fs = require('fs');

const tokenFile = path.resolve(__dirname, 'token.json');

const randomKey = () => {
  return _cryptoJs.AES.randomBytes(20).toString('hex');
};

const readToken = () => {
  if (_fileExists2.default.sync(path.resolve(__dirname, 'token.json'))) {
    let tokenObj = fs.readFileSync(tokenFile, 'utf-8');
    return JSON.parse(tokenObj);
  } else {
    console.log((0, _config.error)(`\nError reading token`));
    return null;
  }
};

const writeToken = token => {
  fs.writeFileSync(path.resolve(__dirname, 'token.json'), JSON.stringify(token), 'utf-8');
};

exports.default = { randomKey, readToken, writeToken };
module.exports = exports['default'];