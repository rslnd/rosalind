electron = require('app')
logger = require './logger'
GhReleases = require('electron-gh-releases')
githubUpdater = new GhReleases
  repo: 'albertzak/rosalind'
  currentVersion: electron.getVersion()

electron.setAppUserModelId('com.squirrel.rosalind.rosalind')

githubUpdater.autoUpdater.on 'error', (err, msg) ->
  logger.info('[Updater]', msg) if msg?
  logger.error('[Updater]', err) if err?

githubUpdater.on 'update-downloaded', (info) ->
  logger.info('[Updater] Update downloaded: ', info)
  logger.info('[Updater] TODO: set a flag to install update on next app launch')

module.exports =
  handleStartupEvent: ->
    return unless process.platform is 'win32'

    squirrelCommand = process.argv[1]

    switch squirrelCommand
      when '--squirrel-install', '--squirrel-updated'
        # Optionally do things such as:
        # - Install desktop and start menu shortcuts
        # - Add your .exe to the PATH
        # - Write to the registry for things like file associations and
        #   explorer context menus
        electron.quit()
        return true

      when '--squirrel-uninstall'
        # Undo anything you did in the --squirrel-install and
        # --squirrel-updated handlers
        electron.quit()
        return true

      when '--squirrel-obsolete'
        # This is called on the outgoing version of your app before
        # we update to the new version - it's the opposite of
        # --squirrel-updated
        electron.quit()
        return true

  check: ->
    logger.info('[Updater] Checking for updates')
    githubUpdater.check (err, status) ->
      if err and err?.message?.indexOf('no newer version') > -1
        logger.info('[Updater] Update check finished: No newer version')
      else if err
        logger.error('[Updater] Update check finished with error:', err)
      else if status
        logger.info('[Updater] Update check finished successfully: ', status)
        logger.info('[Updater] Downloading update in background')
        githubUpdater.download()
