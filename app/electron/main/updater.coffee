electron = require('app')
GhReleases = require('electron-gh-releases')
githubUpdater = new GhReleases
  repo: 'albertzak/rosalind'
  currentVersion: electron.getVersion()

electron.setAppUserModelId('com.squirrel.rosalind.rosalind')

githubUpdater.autoUpdater.on 'error', (err, msg) ->
  console.error('[Updater] Error: ', err) if err
  console.log('[Updater]', msg) if msg

githubUpdater.on 'update-downloaded', (info) ->
  console.log('[Updater] Update downloaded: ', info)
  console.log('[Updater] TODO: set a flag to install update on next app launch')

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
    console.log('[Updater] Checking for updates')
    githubUpdater.check (err, status) ->
      console.log('[Updater] Update check finished: ', err) if (err)
      if not err and status
        console.log('[Updater] Update check finished: ', status)
        console.log('[Updater] Downloading update in background')
        githubUpdater.download()
