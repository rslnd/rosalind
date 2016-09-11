const path = require('path')
const { spawn } = require('child_process')
const { app, autoUpdater } = require('electron')
const logger = require('./logger')
const manifest = require('./manifest')
const settings = require('./settings')

let updateDownloaded = false

const run = (args, done) => {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe')
  console.log('[Updater] Spawning `%s` with args `%s`', updateExe, args)
  spawn(updateExe, args, {
    detached: true
  }).on('close', done)
}

const handleStartupEvent = () => {
  if (process.platform !== 'win32') { return }

  app.setAppUserModelId(manifest.appId)

  const squirrelCommand = process.argv[1]
  const target = path.basename(process.execPath)

  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus
      logger.info('[Updater] Squirrel command: install')
      run(['--createShortcut=' + target + ''], app.quit)
      return true

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers
      logger.info('[Updater] Squirrel command: uninstall')
      run(['--removeShortcut=' + target + ''], app.quit)
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
  logger.info('[Updater] Setting feed URL')
  const feedBaseUrl = (settings && settings.updateUrl) || 'https://update.rslnd.com'
  const feedUrl = feedBaseUrl + '/update/' + process.platform + '/v' + manifest.version
  autoUpdater.setFeedURL(feedUrl)

  autoUpdater.on('error', (err) => {
    if (err) { logger.error('[Updater]', err) }
  })

  autoUpdater.on('checking-for-update', () => {
    logger.info('[Updater] Checking for update')
  })

  autoUpdater.on('update-available', () => {
    logger.info('[Updater] New update available')
  })

  autoUpdater.on('update-not-available', () => {
    logger.info('[Updater] No update')
  })

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    logger.info('[Updater] New update downloaded', { event, releaseNotes, releaseName, releaseDate, updateURL })
    updateDownloaded = true
  })
}

const quitAndInstall = () => {
  if (updateDownloaded) {
    logger.info('[Updater] About to quit and install downloaded update')
    autoUpdater.quitAndInstall()
  }
}

const check = () => {
  logger.info('[Updater] Checking for updates')
  try {
    autoUpdater.checkForUpdates()
  } catch (e) {
    logger.error('[Updater] Cannot check for updates because app is not installed')
  }
}

module.exports = { handleStartupEvent, start, quitAndInstall, check }
