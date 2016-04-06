fs = require 'fs'
shortcut = require 'windows-shortcuts-appid'
electron = require 'app'
autoUpdater = require 'auto-updater'
logger = require './logger'
manifest = require './manifest'
shortcuts = require './shortcuts'

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
    autoUpdater.setFeedURL(settings?.updateUrl or 'https://update.rslnd.com')

    autoUpdater.on 'error', (err) ->
      logger.error('[Updater]', err) if err?

    autoUpdater.on 'checking-for-update', ->
      logger.info('[Updater] Checking for update')

    autoUpdater.on 'update-available', ->
      logger.info('[Updater] New update available')

    autoUpdater.on 'update-not-available', ->
      logger.info('[Updater] No update')

    autoUpdater.on 'update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) ->
      logger.info('[Updater] New update downloaded')
      logger.info('[Updater]', { event, releaseNotes, releaseName, releaseDate, updateURL })


  check: ->
    logger.info('[Updater] Checking for updates')
    try
      autoUpdater.checkForUpdates()
    catch e
      logger.error('[Updater] Cannot check for updates because app is not installed')
