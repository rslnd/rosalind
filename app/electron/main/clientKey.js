const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const logger = require('./logger')
const { app } = require('electron')

const keyPath = path.join(app.getPath('userData'), 'clientKey')

const generateClientKey = () =>
  crypto.randomBytes(265).toString('hex')

const isValid = s =>
  typeof s === 'string' &&
  s.length > 200 &&
  s.match(/^[A-Za-z0-9]+$/)

const writeNewClientKey = (cb) => {
  logger.warn(`[clientKey] Generating new clientKey at ${keyPath}`)

  const clientKey = generateClientKey()

  fs.writeFile(keyPath, clientKey, (err) => {
    if (err) {
      logger.error(`[clientKey] Error writing clientKey to file: ${e}`)
      return
    }

    cb(clientKey)
  })
}

const readClientKey = (cb) => {
  fs.readFile(keyPath, { encoding: 'utf8' }, (err, contents) => {
    if (err) {
      logger.error(`[clientKey] Error reading clientKey ${err}`)
      return
    }

    const clientKey = contents.trim()

    if (isValid(clientKey)) {
      cb(clientKey)
    } else {
      logger.error(`[clientKey] Read invalid clientKey "${clientKey}" from file ${keyPath}`)
    }
  })
}

const ensureClientKey = (cb) => {
  if (!fs.existsSync(keyPath)) {
    writeNewClientKey(cb)
  } else {
    readClientKey(cb)
  }
}

module.exports = { ensureClientKey }
