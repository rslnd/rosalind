const { app, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('./logger')
const manifest = require('./manifest')
const settings = require('./settings')
const shortcuts = require('./shortcuts')
const { captureException } = require('@sentry/electron')

autoUpdater.logger = logger

let updateDownloaded = false
let mainWindow = null

const sendVersion = ({ ipcReceiver }) => {
  mainWindow = ipcReceiver
  mainWindow.webContents.send('version', app.getVersion())
}

const handleStartupEvent = () => {
  if (process.platform !== 'win32') { return }

  app.setAppUserModelId(manifest.appId)

  const squirrelCommand = process.argv[1]

  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus
      logger.info('[Updater] Squirrel command: install')
      shortcuts
        .updateShortcuts()
        .then(app.quit)

      return true

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers
      logger.info('[Updater] Squirrel command: uninstall')
      shortcuts
        .deleteShortcuts()
        .then(app.quit)

      return true

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      logger.info('[Updater] Squirrel command: obsolete')
      app.quit()
      return true
  }
}

const start = () => {
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

    if (mainWindow) {
      mainWindow.webContents.send('update/available', { newVersion: info.version })
    }

    updateDownloaded = true
  })
}

const quitAndInstall = () => {
  if (updateDownloaded) {
    logger.info('[Updater] About to quit/restart and install downloaded update')
    autoUpdater.quitAndInstall()
  }
}

ipcMain.on('update/quitAndInstall', quitAndInstall)

const check = () => {
  if (process.platform !== 'win32') { return }
  try {
    autoUpdater.checkForUpdates()
  } catch (e) {
    logger.error('[Updater] Cannot check for updates because app is not installed')
  }
}

module.exports = { handleStartupEvent, start, quitAndInstall, check, sendVersion }
