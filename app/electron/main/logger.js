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

  fs.exists(oldPath, (exists) => {
    log.info('Old logfile found, removing')
    if (exists) {
      try {
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

  ipcMain.on('log', (e, msg) => {
    log.info(`[ipc] ${inspect(msg)}`)
  })

  ensureOldLogsRemoved()
}

const ready = log => {
  log.info(log)

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
