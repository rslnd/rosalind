const { app, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('./logger')
const { captureException } = require('@sentry/electron')

autoUpdater.logger = logger

let updateDownloaded = false

const start = ({ ipcReceiver }) => {
  logger.info(`[Updater] Current channel is: ${autoUpdater.channel}`)

  if (process.platform !== 'win32') { return }

  autoUpdater.on('error', (err) => {
    if (err) {
      captureException(err)
      logger.error('[Updater] Errored with', err)
    }
  })

  autoUpdater.on('update-available', info => {
    logger.info(`[Updater] New update available: ${info.version}`)
  })

  autoUpdater.on('update-downloaded', info => {
    logger.info(`[Updater] New update downloaded: ${info.version}`)

    ipcReceiver.send('updateAvailable', { newVersion: info.version })

    updateDownloaded = true
  })
}

const quitAndInstall = () => {
  if (updateDownloaded) {
    logger.info('[Updater] About to quit/restart and install downloaded update')
    autoUpdater.quitAndInstall()
  }
}

const setChannel = (e, { channel }) => {
  if (typeof channel === 'string' || channel === null) {
    logger.info(`[Updater] Setting channel to: ${channel}`)
    autoUpdater.channel = channel
    check()
  }
}

ipcMain.on('quitAndInstall', quitAndInstall)
ipcMain.on('settings', setChannel)

const check = () => {
  if (process.platform !== 'win32') { return }
  if (updateDownloaded) { return }

  try {
    autoUpdater.checkForUpdates()
  } catch (e) {
    logger.error('[Updater] Cannot check for updates because app is not installed')
  }
}

module.exports = { start, quitAndInstall, check }
