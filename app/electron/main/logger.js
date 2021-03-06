const os = require('os')
const fs = require('fs')
const path = require('path')
const includes = require('lodash/includes')
const LogDNA = require('logdna')
const { ipcMain, app } = require('electron')
const { inspect } = require('util')

const K = '840559bea375dff05893d84878a50d93'

const program = [ [ 'rosalind', os.platform(), os.arch() ].join('-'), app.getVersion() ].join('/')

let logger = {
  debug: (...c) => console.log(...c),
  info: (...c) => console.log(...c),
  warn: (...c) => console.log(...c),
  error: (...c) => console.log(...c)
}

try {
  // underscore makes logger throw `invalid hostname`
  logger = LogDNA.createLogger(K, {
    app: program,
    env: process.env.NODE_ENV,
    tags: ['electron', os.hostname()]
  })
} catch (e) {
  console.log('[logger] Failed to initialize logger, error was', e)
}

const formatLog = logFn => (...logs) => {
  // JSON.stringify may throw on circular object references
  const message = logs.map(l => inspect(l)).join(' ')
  console.log(message)
  logFn(message)
  return message
}

const log = {
  debug: formatLog(s => logger.debug(s)), // work around this.log undefined inside logdna
  info: formatLog(s => logger.info(s)),
  warn: formatLog(s => logger.warn(s)),
  error: formatLog(s => logger.error(s))
}

const ensureOldLogsRemoved = () => {
  const oldPath = path.join(app.getPath('userData'), 'RosalindElectron.log')

  fs.stat(oldPath, (e, exists) => {
    if (exists) {
      try {
        log.info('Old logfile found, removing')
        fs.unlink(oldPath, () => log.info('Removed old logfile'))
      } catch (e) {
        log.error('Failed to remove old logfile', e)
      }
    }
  })
}

const start = () => {
  log.info(`[Log] App launched in: ${process.execPath}`)
  log.info(`[Log] App version: ${app.getVersion()}`)
  log.info(`[Log] Command line arguments: ${process.argv.join(' ')}`)

  process.on('uncaughtException', err =>
    log.error('[Main] Uncaught exception:', {meta: err})
  )

  process.on('unhandledRejection', err =>
    log.error('[Main] Unhandled rejection:', {meta: err})
  )

  app.on('quit', () =>
    log.info('[Log] App quit')
  )

  // DEBUG
  // ipcMain.on('log', (e, msg) => {
  //   log.info(`[ipc] ${inspect(msg)}`)
  // })

  ensureOldLogsRemoved()
}

const ready = message => {
  log.info(message)

  if (includes(process.argv, '--debug-quit-on-ready')) {
    log.info('[Log] Debug: App launched successfully; now quitting')
    app.quit()
  }
}

module.exports = {
  start,
  ready,
  ...log
}
