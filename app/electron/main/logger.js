const os = require('os')
const fs = require('fs')
const path = require('path')
const includes = require('lodash/includes')
const LogDNA = require('logdna')
const { ipcMain, app } = require('electron')
const { inspect } = require('util')

const K = '840559bea375dff05893d84878a50d93'

const program = [ [ 'rosalind', os.platform(), os.arch() ].join('-'), app.getVersion() ].join('/')

const logger = LogDNA.createLogger(K, {
  hostname: os.hostname(),
  app: program,
  env: process.env.NODE_ENV,
  tags: ['electron']
})


const ensureOldLogsRemoved = () => {
  const oldPath = path.join(app.getPath('userData'), 'RosalindElectron.log')

  fs.exists(oldPath, (exists) => {
    if (exists) {
      try {
        fs.unlink(oldPath)
      } catch (e) {

      }
    }
  })
}

const start = () => {
  logger.info(`[Log] App launched in: ${process.execPath}`)
  logger.info(`[Log] App version: ${app.getVersion()}`)
  logger.info(`[Log] Command line arguments: ${process.argv.join(' ')}`)

  process.on('uncaughtException', err =>
    logger.error('[Main] Uncaught exception:', {meta: err})
  )

  process.on('unhandledRejection', err =>
    logger.error('[Main] Unhandled rejection:', {meta: err})
  )

  app.on('quit', () =>
    logger.info('[Log] App quit')
  )

  ipcMain.on('log', (e, msg) => {
    logger.info(`[ipc] ${inspect(msg)}`)
  })

  ensureOldLogsRemoved()
}

const ready = log => {
  logger.info(log)

  if (includes(process.argv, '--debug-quit-on-ready')) {
    logger.info('[Log] Debug: App launched successfully; now quitting')
    app.quit()
  }
}

const formatLog = logFn => (...logs) => {
  // JSON.stringify may throw on circular object references
  const message = logs.map(l => inspect(l)).join(' ')
  logFn(message)
  return message
}

module.exports = {
  start,
  ready,
  debug: formatLog(logger.debug),
  info: formatLog(logger.info),
  warn: formatLog(logger.warn),
  error: formatLog(logger.error)
}
