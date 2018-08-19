const os = require('os')
const path = require('path')
const url = require('url')
const includes = require('lodash/includes')
const winston = require('winston')
require('winston-papertrail')
const { ipcMain, app } = require('electron')

const start = () => {
  winston.add(winston.transports.File, {
    filename: path.join(app.getPath('userData'), 'RosalindElectron.log'),
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: 'debug',
    json: false,
    maxsize: 1024 * 1024 * 10,
    maxFiles: 1,
    eol: '\r\n'
  })

  // Grunt replaces the @@ variables on CI
  if ('@@CI'.indexOf('@@') === -1) {
    const host = '@@PAPERTRAIL_URL'.split(':')[0]
    const port = parseInt('@@PAPERTRAIL_URL'.split(':')[1])

    if (host && port) {
      let customerHostname = 'development'
      try {
        const settings = require('./settings')
        customerHostname = url.parse(settings.url).hostname
      } catch (e) {
        winston.error('[Log] Could not parse customer hostname for centralized logging, falling back to "development"', e)
      }

      const hostname = [os.hostname(), customerHostname].join('.')
      const program = [ [ 'rosalind', os.platform(), os.arch() ].join('-'), app.getVersion() ].join('/')
      winston.info('[Log] Enabling papertrail log transport', { program, hostname })
      winston.add(winston.transports.Papertrail, { host, port, program, hostname })
    }
  }

  winston.info('[Log] App launched in: ', process.execPath)
  winston.info('[Log] App version: ', app.getVersion())
  winston.info('[Log] Command line arguments: ', process.argv)

  process.on('uncaughtException', err =>
    winston.error('[Main] Uncaught Exception:', err)
  )

  app.on('quit', () =>
    winston.info('[Log] App quit')
  )

  ipcMain.on('log', (e, err) =>
    winston.log(err.level, err.message, err.payload)
  )
}

const ready = log => {
  winston.info(log)

  if (includes(process.argv, '--debug-quit-on-ready')) {
    winston.info('[Log] Debug: App launched successfully; now quitting')
    app.quit()
  }
}

const formatLog = logger => (...logs) => {
  const message = logs.map(l => JSON.stringify(l)).join(' ')
  logger(message)
  return message
}

module.exports = {
  start,
  ready,
  debug: formatLog(winston.debug),
  info: formatLog(winston.info),
  warn: formatLog(winston.warn),
  error: formatLog(winston.error)
}
