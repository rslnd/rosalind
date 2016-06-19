fs = require 'fs'
shortcut = require 'windows-shortcuts-appid'
electron = require 'app'
autoUpdater = require 'auto-updater'
logger = require './logger'
manifest = require './manifest'
shortcuts = require './shortcuts'

updateDownloaded = false

module.exports =
  handleStartupEvent: ->
    return unless process.platform is 'win32'

    electron.setAppUserModelId(manifest.appId)

    squirrelCommand = process.argv[1]

    switch squirrelCommand
      when '--squirrel-install', '--squirrel-updated'
        # Optionally do things such as:
        # - Install desktop and start menu shortcuts
        # - Add your .exe to the PATH
        # - Write to the registry for things like file associations and
        #   explorer context menus
        logger.info('[Updater] Squirrel command: install')
        shortcuts.updateShortcuts()
        setTimeout(electron.quit, 600)
        return true

      when '--squirrel-uninstall'
        # Undo anything you did in the --squirrel-install and
        # --squirrel-updated handlers
        logger.info('[Updater] Squirrel command: uninstall')
        shortcuts.deleteShortcuts()
        setTimeout(electron.quit, 600)
        return true

      when '--squirrel-obsolete'
        # This is called on the outgoing version of your app before
        # we update to the new version - it's the opposite of
        # --squirrel-updated
        logger.info('[Updater] Squirrel command: obsolete')
        setTimeout(electron.quit, 600)
        return true

  start: ->
    logger.info('[Updater] Setting feed URL')
    feedUrl = settings?.updateUrl or 'https://update.rslnd.com'
    feedUrl = feedUrl + '/update/' + process.platform + '/v' + manifest.version
    autoUpdater.setFeedURL(feedUrl)

    autoUpdater.on 'error', (err) ->
      logger.error('[Updater]', err) if err?

    autoUpdater.on 'checking-for-update', ->
      logger.info('[Updater] Checking for update')

    autoUpdater.on 'update-available', ->
      logger.info('[Updater] New update available')

    autoUpdater.on 'update-not-available', ->
      logger.info('[Updater] No update')

    autoUpdater.on 'update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) ->
      logger.info('[Updater] New update downloaded', { event, releaseNotes, releaseName, releaseDate, updateURL })
      updateDownloaded = true

  quitAndInstall: ->
    if updateDownloaded
      logger.info('[Updater] About to quit and install downloaded update')
      autoUpdater.quitAndInstall()

  check: ->
    logger.info('[Updater] Checking for updates')
    try
      autoUpdater.checkForUpdates()
    catch e
      logger.error('[Updater] Cannot check for updates because app is not installed')
